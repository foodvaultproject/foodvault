import { isSupabaseConfigured } from "@/lib/auth";
import {
  compareBinLocation,
  shortOrderId,
  type PickerOrderDetail,
  type PickerQueueCard,
  type PickerQueueTab,
} from "@/lib/admin/picker-shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { FoodVaultOrderStatus } from "@/types/commerce";

export type { PickerOrderDetail, PickerQueueCard, PickerQueueTab };

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

async function pickerClient() {
  return createAdminClient() ?? (isSupabaseConfigured() ? await createClient() : null);
}

function startOfDayInTimeZone(timeZone: string, now = new Date()): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  for (const offset of ["+13:00", "+12:00"]) {
    const candidate = new Date(`${ymd}T00:00:00${offset}`);
    const hour = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(candidate);
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(candidate);
    if (date === ymd && hour === "00") return candidate;
  }

  return new Date(`${ymd}T00:00:00+12:00`);
}

function addressSummary(row: Record<string, unknown>): string {
  return [asString(row.shipping_line1), asString(row.shipping_city), asString(row.shipping_postal_code)]
    .filter(Boolean)
    .join(", ");
}

function toQueueCard(row: Record<string, unknown>, itemCount: number): PickerQueueCard {
  return {
    id: asString(row.id),
    shortId: shortOrderId(asString(row.id)),
    customerName: asString(row.shipping_name, "Member order"),
    addressSummary: addressSummary(row) || "No shipping address",
    itemCount,
    total: asNumber(row.total),
    paidAt: asString(row.created_at),
    status: asString(row.status, "paid") as FoodVaultOrderStatus,
  };
}

async function attachItemCounts(
  supabase: NonNullable<Awaited<ReturnType<typeof pickerClient>>>,
  rows: Record<string, unknown>[]
): Promise<PickerQueueCard[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => asString(row.id)).filter(Boolean);
  const { data: items } = await supabase
    .from("foodvault_order_items")
    .select("order_id, quantity")
    .in("order_id", ids);

  const countByOrder = new Map<string, number>();
  for (const item of items ?? []) {
    const record = item as Record<string, unknown>;
    const orderId = asString(record.order_id);
    countByOrder.set(orderId, (countByOrder.get(orderId) ?? 0) + Math.trunc(asNumber(record.quantity, 1)));
  }

  return rows.map((row) => toQueueCard(row, countByOrder.get(asString(row.id)) ?? 0));
}

export async function listPickerQueue(tab: PickerQueueTab): Promise<PickerQueueCard[]> {
  const supabase = await pickerClient();
  if (!supabase) return [];

  if (tab === "fulfilled") {
    const start = startOfDayInTimeZone("Pacific/Auckland");
    const startIso = start.toISOString();
    let { data, error } = await supabase
      .from("foodvault_orders")
      .select("*")
      .eq("status", "fulfilled")
      .gte("fulfilled_at", startIso)
      .order("created_at", { ascending: false });

    if (error) {
      ({ data, error } = await supabase
        .from("foodvault_orders")
        .select("*")
        .eq("status", "fulfilled")
        .order("created_at", { ascending: false }));
    }

    if (error) {
      console.error("[picker] failed to list fulfilled orders", error.message);
      return [];
    }

    const rows = ((data ?? []) as Record<string, unknown>[]).filter((row) => {
      const stamp = asString(row.fulfilled_at) || asString(row.updated_at) || asString(row.created_at);
      return new Date(stamp).getTime() >= start.getTime();
    });
    return attachItemCounts(supabase, rows);
  }

  const { data: orders, error } = await supabase
    .from("foodvault_orders")
    .select("*")
    .eq("status", "paid")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[picker] failed to list paid orders", error.message);
    return [];
  }

  return attachItemCounts(supabase, (orders ?? []) as Record<string, unknown>[]);
}

export async function getPickerOrder(orderId: string): Promise<PickerOrderDetail | null> {
  const supabase = await pickerClient();
  if (!supabase || !orderId.trim()) return null;

  const { data: order, error } = await supabase
    .from("foodvault_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return null;
  const row = order as Record<string, unknown>;

  const { data: items } = await supabase
    .from("foodvault_order_items")
    .select("*")
    .eq("order_id", orderId);

  const lineRows = (items ?? []) as Record<string, unknown>[];
  const productIds = [...new Set(lineRows.map((item) => asString(item.product_id)).filter(Boolean))];
  const skus = [...new Set(lineRows.map((item) => asString(item.sku)).filter(Boolean))];

  const products = new Map<string, Record<string, unknown>>();
  if (productIds.length > 0) {
    const { data } = await supabase.from("foodvault_products").select("*").in("id", productIds);
    for (const product of data ?? []) {
      const record = product as Record<string, unknown>;
      products.set(asString(record.id), record);
      if (asString(record.sku)) products.set(asString(record.sku), record);
    }
  }
  if (skus.length > 0) {
    const { data } = await supabase.from("foodvault_products").select("*").in("sku", skus);
    for (const product of data ?? []) {
      const record = product as Record<string, unknown>;
      products.set(asString(record.id), record);
      if (asString(record.sku)) products.set(asString(record.sku), record);
    }
  }

  const lines = lineRows
    .map((item, index) => {
      const product =
        products.get(asString(item.product_id)) ?? products.get(asString(item.sku)) ?? null;
      const productId = asString(item.product_id);
      const sku = asString(item.sku) || asString(product?.sku);
      return {
        itemId: asString(item.id) || `${orderId}:${productId}:${sku}:${index}`,
        productId,
        name: asString(item.name, asString(product?.name, "Vault Market item")),
        sku,
        brand: asString(product?.brand, "FoodVault"),
        quantity: Math.max(1, Math.trunc(asNumber(item.quantity, 1))),
        imageUrl: asString(product?.image_url) || null,
        binLocation: asString(product?.bin_location),
        barcode: asString(product?.barcode) || asString(product?.sku) || null,
      };
    })
    .sort((a, b) => compareBinLocation(a.binLocation, b.binLocation));

  return {
    id: asString(row.id),
    shortId: shortOrderId(asString(row.id)),
    status: asString(row.status, "paid") as FoodVaultOrderStatus,
    customerName: asString(row.shipping_name, "Member order"),
    addressSummary: addressSummary(row) || "No shipping address",
    total: asNumber(row.total),
    paidAt: asString(row.created_at),
    trackingNumber: asString(row.tracking_number) || null,
    lines,
  };
}
