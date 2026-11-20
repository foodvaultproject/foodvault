"use server";

import { headers } from "next/headers";
import { getAppMode } from "@/lib/app-mode";
import { multibuyAwareLineTotal, offerPrice } from "@/lib/commerce/catalog";
import {
  getScheduleProductSnapshots,
  getVaultMarketProductsByIds,
  searchActivePantryProducts,
} from "@/lib/commerce/products";
import {
  advanceScheduleDate,
  aucklandToday,
  firstRunOnOrAfter,
  type ScheduleFrequency,
  type ScheduleStatus,
} from "@/lib/commerce/recurring-schedule-dates";
import type {
  ScheduleAddress,
  ScheduleChoice,
  ScheduleDraft,
  ScheduleRecord,
} from "@/lib/commerce/recurring-schedule-types";
import { getStockupCardSummary, type StockupCardSummary } from "@/lib/commerce/stockup-billing";
import { vaultMarketFreight } from "@/lib/commerce/shipping";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireStockupUser() {
  const headerStore = await headers();
  if (getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) !== "stockup") {
    throw new Error("Auto-Restock is only available on StockUp");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };
  return { supabase, user };
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function addressFromRow(row: Record<string, unknown>): ScheduleAddress {
  return {
    fullName: text(row.shipping_name),
    phone: text(row.shipping_phone),
    email: text(row.shipping_email),
    street: text(row.shipping_line1),
    suburb: text(row.shipping_line2),
    city: text(row.shipping_city),
    postcode: text(row.shipping_postal_code),
    deliveryNotes: text(row.delivery_notes),
  };
}

function lineSubtotal(
  product: { member_price: number; retail_price: number; is_multibuy?: boolean; multibuy_quantity?: number | null; multibuy_price?: number | null },
  quantity: number
) {
  return multibuyAwareLineTotal({
    memberPrice: offerPrice(product),
    quantity,
    isMultibuy: product.is_multibuy,
    multibuyQuantity: product.multibuy_quantity,
    multibuyPrice: product.multibuy_price,
  });
}

export async function loadAutoRestockPage(member: {
  id: string;
  email: string;
}): Promise<{
  email: string;
  card: StockupCardSummary | null;
  schedules: ScheduleRecord[];
} | null> {
  const headerStore = await headers();
  if (getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) !== "stockup") {
    return null;
  }
  const supabase = await createClient();

  const [{ data: schedules, error }, card] = await Promise.all([
    supabase
      .from("recurring_schedules")
      .select("*, recurring_schedule_items(*), recurring_schedule_dates(*)")
      .eq("user_id", member.id)
      .order("created_at", { ascending: false }),
    getStockupCardSummary(member.id),
  ]);

  let rows = (schedules ?? []) as Record<string, unknown>[];
  let itemRows = rows.flatMap((row) =>
    Array.isArray(row.recurring_schedule_items) ? (row.recurring_schedule_items as Record<string, unknown>[]) : []
  );
  let dateRows = rows.flatMap((row) =>
    Array.isArray(row.recurring_schedule_dates) ? (row.recurring_schedule_dates as Record<string, unknown>[]) : []
  );

  if (error) {
    const fallback = await supabase
      .from("recurring_schedules")
      .select("*")
      .eq("user_id", member.id)
      .order("created_at", { ascending: false });
    if (fallback.error) throw new Error(fallback.error.message);
    rows = (fallback.data ?? []) as Record<string, unknown>[];
    const ids = rows.map((row) => text(row.id)).filter(Boolean);
    const [items, dates] = await Promise.all([
      ids.length
        ? supabase.from("recurring_schedule_items").select("*").in("schedule_id", ids)
        : Promise.resolve({ data: [] }),
      ids.length
        ? supabase.from("recurring_schedule_dates").select("*").in("schedule_id", ids)
        : Promise.resolve({ data: [] }),
    ]);
    itemRows = (items.data ?? []) as Record<string, unknown>[];
    dateRows = (dates.data ?? []) as Record<string, unknown>[];
  }
  const products = await getScheduleProductSnapshots(
    itemRows.map((row) => text(row.product_id)).filter(Boolean)
  );
  const productById = new Map(products.map((product) => [product.id, product]));

  const records: ScheduleRecord[] = rows.map((row) => {
    const id = text(row.id);
    const lines = itemRows
      .filter((item) => text(item.schedule_id) === id)
      .map((item) => {
        const productId = text(item.product_id);
        const product = productById.get(productId);
        const quantity = Math.max(1, Math.trunc(Number(item.quantity) || 1));
        const unitPrice = product ? offerPrice(product) : 0;
        return {
          productId,
          name: product?.name ?? "Unavailable product",
          brand: product?.brand ?? "",
          quantity,
          unitPrice,
          imageUrl: product?.image_url ?? null,
          description: product?.description ?? null,
          available: Boolean(product?.is_active),
          subtotal: product ? lineSubtotal(product, quantity) : 0,
        };
      });
    const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
    return {
      id,
      name: text(row.name),
      status: text(row.status) as ScheduleStatus,
      frequencyType: text(row.frequency_type) as ScheduleFrequency,
      intervalDays: row.interval_days == null ? null : Math.trunc(Number(row.interval_days)),
      nextRunDate: text(row.next_run_date) || null,
      endDate: text(row.end_date) || null,
      pausedUntil: text(row.paused_until) || null,
      address: addressFromRow(row),
      items: lines.map(({ subtotal: _subtotal, ...line }) => line),
      customDates: dateRows
        .filter((date) => text(date.schedule_id) === id)
        .map((date) => ({
          date: text(date.scheduled_date),
          skipped: Boolean(date.processed_at) && !text(date.order_id),
        }))
        .filter((date) => date.date)
        .sort((a, b) => a.date.localeCompare(b.date)),
      subtotal,
      freight: vaultMarketFreight(subtotal),
    };
  });

  return { email: member.email, card, schedules: records };
}

export async function listScheduleChoices(): Promise<{
  authenticated: boolean;
  schedules: ScheduleChoice[];
}> {
  const { supabase, user } = await requireStockupUser();
  if (!user) return { authenticated: false, schedules: [] };
  const { data, error } = await supabase
    .from("recurring_schedules")
    .select("id, name, status")
    .eq("user_id", user.id)
    .in("status", ["ACTIVE", "PAUSED"])
    .order("name", { ascending: true });
  if (error) return { authenticated: true, schedules: [] };
  return {
    authenticated: true,
    schedules: ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      id: text(row.id),
      name: text(row.name),
      status: text(row.status) as ScheduleChoice["status"],
    })),
  };
}

export async function searchScheduleProducts(query: string) {
  await requireStockupUser();
  const products = await searchActivePantryProducts(query);
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: offerPrice(product),
    imageUrl: product.image_url,
  }));
}

function cleanAddress(address: ScheduleAddress): ScheduleAddress {
  return {
    fullName: address.fullName.trim(),
    phone: address.phone.trim(),
    email: address.email.trim(),
    street: address.street.trim(),
    suburb: address.suburb.trim(),
    city: address.city.trim(),
    postcode: address.postcode.trim(),
    deliveryNotes: address.deliveryNotes.trim(),
  };
}

function validateDraft(draft: ScheduleDraft, today: string): string | null {
  if (!draft.name.trim()) return "Give this schedule a name";
  if (draft.name.trim().length > 80) return "Schedule name must be 80 characters or fewer";
  if (!draft.items.length) return "Add at least one product";
  if (draft.items.some((item) => !UUID_RE.test(item.productId) || item.quantity < 1 || item.quantity > 99)) {
    return "Each product needs a quantity from 1 to 99";
  }
  const address = cleanAddress(draft.address);
  if (!address.fullName || !address.street || !address.city || !address.postcode || !address.email) {
    return "Add a name, email, street, city, and postcode";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) return "Enter a valid email";
  if (draft.frequencyType === "CUSTOM_INTERVAL") {
    const days = Math.trunc(draft.intervalDays ?? 0);
    if (days < 1 || days > 365) return "Custom intervals must be between 1 and 365 days";
  }
  if (draft.frequencyType === "CUSTOM_DATES") {
    const dates = [...new Set(draft.customDates)].filter((date) => date >= today);
    if (!dates.length) return "Choose at least one future date";
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.startDate)) return "Choose a start date";
  if (draft.endDate && draft.endDate < draft.startDate) return "End date must be on or after the start date";
  return null;
}

export async function saveSchedule(draft: ScheduleDraft): Promise<{ id?: string; error?: string }> {
  const { supabase, user } = await requireStockupUser();
  if (!user) return { error: "Sign in to save an Auto-Restock schedule" };
  const today = aucklandToday();
  const problem = validateDraft(draft, today);
  if (problem) return { error: problem };

  const address = cleanAddress(draft.address);
  const frequency = draft.frequencyType;
  const intervalDays = frequency === "CUSTOM_INTERVAL" ? Math.trunc(draft.intervalDays ?? 0) : null;
  const customDates =
    frequency === "CUSTOM_DATES"
      ? [...new Set(draft.customDates)].filter((date) => date >= today).sort()
      : [];
  const nextRunDate =
    frequency === "CUSTOM_DATES"
      ? customDates[0] ?? null
      : firstRunOnOrAfter(draft.startDate, today, frequency, intervalDays);
  const now = new Date().toISOString();
  const payload = {
    user_id: user.id,
    name: draft.name.trim(),
    frequency_type: frequency,
    interval_days: intervalDays,
    next_run_date: nextRunDate,
    end_date: frequency === "CUSTOM_DATES" ? null : draft.endDate || null,
    shipping_name: address.fullName,
    shipping_line1: address.street,
    shipping_line2: address.suburb || null,
    shipping_city: address.city,
    shipping_postal_code: address.postcode,
    shipping_country: "NZ",
    shipping_phone: address.phone || null,
    shipping_email: address.email,
    delivery_notes: address.deliveryNotes || null,
    updated_at: now,
  };

  let scheduleId = draft.id?.trim() || "";
  if (scheduleId) {
    const { data, error } = await supabase
      .from("recurring_schedules")
      .update(payload)
      .eq("id", scheduleId)
      .eq("user_id", user.id)
      .neq("status", "CANCELLED")
      .select("id")
      .maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: "That schedule could not be updated" };
  } else {
    const { data, error } = await supabase
      .from("recurring_schedules")
      .insert({ ...payload, status: "ACTIVE" })
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "Could not create the schedule" };
    scheduleId = data.id;
  }

  const { error: deleteItemsError } = await supabase
    .from("recurring_schedule_items")
    .delete()
    .eq("schedule_id", scheduleId);
  if (deleteItemsError) return { error: deleteItemsError.message };

  const merged = new Map<string, number>();
  for (const item of draft.items) {
    merged.set(item.productId, Math.min(99, (merged.get(item.productId) ?? 0) + Math.trunc(item.quantity)));
  }
  const { error: itemError } = await supabase.from("recurring_schedule_items").insert(
    [...merged.entries()].map(([productId, quantity]) => ({
      schedule_id: scheduleId,
      product_id: productId,
      quantity,
    }))
  );
  if (itemError) return { error: itemError.message };

  const { error: deleteDatesError } = await supabase
    .from("recurring_schedule_dates")
    .delete()
    .eq("schedule_id", scheduleId)
    .is("processed_at", null);
  if (deleteDatesError) return { error: deleteDatesError.message };

  if (customDates.length) {
    const { error: dateError } = await supabase.from("recurring_schedule_dates").upsert(
      customDates.map((date) => ({ schedule_id: scheduleId, scheduled_date: date })),
      { onConflict: "schedule_id,scheduled_date", ignoreDuplicates: true }
    );
    if (dateError) return { error: dateError.message };
  }

  return { id: scheduleId };
}

export async function addProductToSchedule(
  scheduleId: string,
  productId: string,
  quantity = 1
): Promise<{ error?: string }> {
  const { supabase, user } = await requireStockupUser();
  if (!user) return { error: "Sign in to use Auto-Restock" };
  if (!UUID_RE.test(scheduleId) || !UUID_RE.test(productId)) return { error: "Unknown product" };
  const addQty = Math.min(99, Math.max(1, Math.trunc(quantity)));

  const { data: schedule } = await supabase
    .from("recurring_schedules")
    .select("id, status")
    .eq("id", scheduleId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!schedule || schedule.status === "CANCELLED") return { error: "Choose an active or paused schedule" };

  const products = await getVaultMarketProductsByIds([productId]);
  if (!products[0]?.is_active) return { error: "That product is not available" };

  const { data: existing } = await supabase
    .from("recurring_schedule_items")
    .select("id, quantity")
    .eq("schedule_id", scheduleId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("recurring_schedule_items")
      .update({ quantity: Math.min(99, Number(existing.quantity) + addQty) })
      .eq("id", existing.id);
    return error ? { error: error.message } : {};
  }

  const { error } = await supabase.from("recurring_schedule_items").insert({
    schedule_id: scheduleId,
    product_id: productId,
    quantity: addQty,
  });
  return error ? { error: error.message } : {};
}

export async function setSchedulePaused(
  scheduleId: string,
  paused: boolean,
  resumeOn: string | null
): Promise<{ error?: string }> {
  const { supabase, user } = await requireStockupUser();
  if (!user) return { error: "Sign in to manage Auto-Restock" };
  const today = aucklandToday();
  if (paused && resumeOn && resumeOn < today) return { error: "Auto-resume must be today or later" };
  const { data, error } = await supabase
    .from("recurring_schedules")
    .update({
      status: paused ? "PAUSED" : "ACTIVE",
      paused_until: paused ? resumeOn || null : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", scheduleId)
    .eq("user_id", user.id)
    .neq("status", "CANCELLED")
    .select("id")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "That schedule could not be updated" };
  return {};
}

export async function skipNextScheduleDelivery(scheduleId: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireStockupUser();
  if (!user) return { error: "Sign in to manage Auto-Restock" };
  const { data: schedule, error } = await supabase
    .from("recurring_schedules")
    .select("id, status, frequency_type, interval_days, next_run_date")
    .eq("id", scheduleId)
    .eq("user_id", user.id)
    .neq("status", "CANCELLED")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!schedule) return { error: "That schedule could not be updated" };

  const frequency = schedule.frequency_type as ScheduleFrequency;
  const today = aucklandToday();
  if (frequency === "CUSTOM_DATES") {
    const { data: dates } = await supabase
      .from("recurring_schedule_dates")
      .select("id, scheduled_date")
      .eq("schedule_id", scheduleId)
      .is("processed_at", null)
      .order("scheduled_date", { ascending: true });
    const upcoming = ((dates ?? []) as { id: string; scheduled_date: string }[]).filter(
      (date) => date.scheduled_date >= today
    );
    const next = upcoming[0];
    if (!next) return { error: "There is no upcoming date to skip" };
    const { error: markError } = await supabase
      .from("recurring_schedule_dates")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", next.id);
    if (markError) return { error: markError.message };
    const following = upcoming[1]?.scheduled_date ?? null;
    await supabase
      .from("recurring_schedules")
      .update({ next_run_date: following, updated_at: new Date().toISOString() })
      .eq("id", scheduleId);
    return {};
  }

  const current = schedule.next_run_date || today;
  const next = advanceScheduleDate(current, frequency, schedule.interval_days);
  const { error: updateError } = await supabase
    .from("recurring_schedules")
    .update({ next_run_date: next, updated_at: new Date().toISOString() })
    .eq("id", scheduleId);
  return updateError ? { error: updateError.message } : {};
}

export async function cancelSchedule(scheduleId: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireStockupUser();
  if (!user) return { error: "Sign in to manage Auto-Restock" };
  const { error } = await supabase
    .from("recurring_schedules")
    .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
    .eq("id", scheduleId)
    .eq("user_id", user.id);
  return error ? { error: error.message } : {};
}
