"use server";

import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { getAdminUser, logAuditAction } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/auth";
import { settleInventoryForPick } from "@/lib/commerce/fulfill-pantry-order";
import {
  amountToMinorUnits,
  minimumCaptureMinor,
  minorUnitsToAmount,
  settlePicks,
} from "@/lib/commerce/pick-settlement";
import { sendAdminPackingInvoiceEmail } from "@/lib/email-templates/templates/supermarket/admin-packing-invoice";
import { sendSupermarketOrderCanceledEmail } from "@/lib/email-templates/templates/supermarket/order-canceled";
import { sendSupermarketOrderFulfilledEmail } from "@/lib/email-templates/templates/supermarket/order-fulfilled";
import { getStripeClient } from "@/lib/payment-service/providers/stripe-client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const LOCK_MS = 120_000;

type ActionResult = { error: string } | { success: true; cancelled?: boolean };

type OrderRow = Record<string, unknown>;

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function parsePicks(raw: string): Record<string, number> | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const picks: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!key.trim()) return null;
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0) return null;
      picks[key] = value;
    }
    return picks;
  } catch {
    return null;
  }
}

function stripeErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Stripe could not update this payment.";
}

function committedUnits(row: OrderRow): number {
  const raw = row.quantity_committed;
  if (raw == null || raw === "") return 0;
  return Math.max(0, Math.trunc(asNumber(raw)));
}

function lockIsFresh(updatedAt: unknown): boolean {
  const stamp = new Date(asString(updatedAt)).getTime();
  if (!Number.isFinite(stamp)) return false;
  return Date.now() - stamp < LOCK_MS;
}

async function pickerDb() {
  return createAdminClient() ?? (await createClient());
}

export async function fulfillPickerOrderAction(formData: FormData): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured." };

  const orderId = String(formData.get("order_id") ?? "").trim();
  const trackingNumber = String(formData.get("tracking_number") ?? "").trim();
  const picks = parsePicks(String(formData.get("picks") ?? ""));
  if (!orderId) return { error: "Order is required." };
  if (!picks) return { error: "Pick quantities are missing." };

  const supabase = await pickerDb();
  const { data: orderData, error: orderError } = await supabase
    .from("foodvault_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) return { error: orderError.message };
  if (!orderData) return { error: "Order not found." };

  const order = orderData as OrderRow;
  const status = asString(order.status);
  if (status === "fulfilled") return { success: true };
  if (status === "cancelled" || status === "refunded") {
    return { error: "This order is already closed." };
  }

  const { data: itemData, error: itemError } = await supabase
    .from("foodvault_order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemError) return { error: itemError.message };
  const itemRows = (itemData ?? []) as OrderRow[];
  if (itemRows.length === 0) return { error: "This order has no line items." };

  for (const item of itemRows) {
    const itemId = asString(item.id);
    const ordered = Math.max(0, Math.trunc(asNumber(item.quantity, 1)));
    const picked = picks[itemId];
    if (picked == null) return { error: "Mark every line as picked or out of stock." };
    if (picked > ordered) return { error: "Picked quantity cannot exceed the ordered quantity." };
  }

  const currency = asString(order.currency, "NZD").toUpperCase();
  const subtotal = asNumber(order.subtotal);
  const authorizedTotal = asNumber(order.total);
  const storedShipping = order.shipping_cost;
  const shippingCost =
    storedShipping == null || storedShipping === ""
      ? Math.max(0, authorizedTotal - subtotal)
      : asNumber(storedShipping);

  const settlement = settlePicks({
    currency,
    shippingCost,
    authorizedMinor: amountToMinorUnits(authorizedTotal, currency),
    lines: itemRows.map((item) => ({
      itemId: asString(item.id),
      name: asString(item.name, "Vault Market item"),
      sku: asString(item.sku),
      productId: asString(item.product_id),
      quantity: Math.max(0, Math.trunc(asNumber(item.quantity, 1))),
      unitPrice: asNumber(item.unit_price),
      lineTotal: asNumber(item.line_total),
      quantityPicked: picks[asString(item.id)] ?? 0,
    })),
  });

  if (
    settlement.totalMinor > 0 &&
    settlement.totalMinor < minimumCaptureMinor(currency)
  ) {
    return {
      error: "The picked total is below the card minimum. Pick more of the order, or mark every line out of stock to release the hold.",
    };
  }

  const stockCommitted = Object.fromEntries(
    itemRows.map((item) => [asString(item.id), committedUnits(item)])
  );

  if (status === "capturing") {
    try {
      const recovered = await recoverInProgressOrder({
        supabase,
        order,
        orderId,
        trackingNumber,
        settlement,
        currency,
        stockCommitted,
      });
      if (recovered) return recovered;
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "This order is already being submitted. Wait a moment, then submit again.",
      };
    }
  }

  if (status !== "authorized" && status !== "paid" && status !== "capturing") {
    return { error: "Order is not ready to fulfill." };
  }

  const claimedAt = new Date().toISOString();
  let claim = supabase
    .from("foodvault_orders")
    .update({ status: "capturing", updated_at: claimedAt })
    .eq("id", orderId);

  if (status === "capturing") {
    const updatedAt = asString(order.updated_at);
    claim = updatedAt
      ? claim.eq("status", "capturing").eq("updated_at", updatedAt)
      : claim.eq("status", "capturing");
  } else {
    claim = claim.eq("status", status);
  }

  const { data: claimed, error: claimError } = await claim.select("id").maybeSingle();
  if (claimError) return { error: claimError.message };
  if (!claimed) {
    const { data: latest } = await supabase
      .from("foodvault_orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle();
    const latestStatus = asString((latest as OrderRow | null)?.status);
    if (latestStatus === "fulfilled") return { success: true };
    if (latestStatus === "cancelled") return { success: true, cancelled: true };
    return { error: "This order is already being submitted." };
  }

  const revertStatus = status === "capturing" ? "authorized" : status;

  const pickWrites = await Promise.all(
    itemRows.map((item) =>
      supabase
        .from("foodvault_order_items")
        .update({ quantity_picked: picks[asString(item.id)] ?? 0 })
        .eq("id", asString(item.id))
        .eq("order_id", orderId)
    )
  );
  const pickWriteError = pickWrites.find((result) => result.error)?.error;
  if (pickWriteError) {
    await revertClaim(supabase, orderId, revertStatus);
    if (/quantity_picked/i.test(pickWriteError.message)) {
      return { error: "Pick quantities are not available yet. Apply the latest database migration." };
    }
    return { error: pickWriteError.message };
  }

  const paymentIntentId = asString(order.stripe_payment_intent_id);
  let payment: { cancelled: boolean; capturedMinor: number };
  try {
    payment = await settleStripePayment({
      orderId,
      paymentIntentId,
      totalMinor: settlement.totalMinor,
    });
  } catch (error) {
    const settledMinor = await settledCaptureMinor(paymentIntentId);
    if (settledMinor === "cancelled") {
      payment = { cancelled: true, capturedMinor: 0 };
    } else if (typeof settledMinor === "number") {
      payment = { cancelled: false, capturedMinor: settledMinor };
    } else {
      await revertClaim(supabase, orderId, revertStatus);
      return { error: stripeErrorMessage(error) };
    }
  }

  try {
    const finalized = await finalizeOrder({
      supabase,
      order,
      orderId,
      trackingNumber,
      settlement,
      currency,
      stockCommitted,
      cancelled: payment.cancelled,
      capturedMinor: payment.capturedMinor,
    });
    if (finalized === "lost") return { success: true, cancelled: payment.cancelled };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `${error.message} The card was already updated. Submit again to finish the order.`
          : "The card was updated, but the order record did not save. Submit again to finish.",
    };
  }

  return { success: true, cancelled: payment.cancelled };
}

async function recoverInProgressOrder(input: {
  supabase: Awaited<ReturnType<typeof pickerDb>>;
  order: OrderRow;
  orderId: string;
  trackingNumber: string;
  settlement: ReturnType<typeof settlePicks>;
  currency: string;
  stockCommitted: Record<string, number>;
}): Promise<ActionResult | null> {
  const paymentIntentId = asString(input.order.stripe_payment_intent_id);
  const settled = await settledCaptureMinor(paymentIntentId);
  const stillOpen = settled === "open" || settled === "missing";
  if (stillOpen) {
    return lockIsFresh(input.order.updated_at)
      ? { error: "This order is already being submitted. Wait a moment, then submit again." }
      : null;
  }

  const cancelled = settled === "cancelled";
  await finalizeOrder({
    supabase: input.supabase,
    order: input.order,
    orderId: input.orderId,
    trackingNumber: input.trackingNumber,
    settlement: input.settlement,
    currency: input.currency,
    stockCommitted: input.stockCommitted,
    cancelled,
    capturedMinor: cancelled ? 0 : settled,
  });
  return { success: true, cancelled };
}

async function settledCaptureMinor(
  paymentIntentId: string
): Promise<number | "cancelled" | "open" | "missing"> {
  if (!paymentIntentId) return "missing";
  try {
    const intent = await getStripeClient().paymentIntents.retrieve(paymentIntentId);
    if (intent.status === "succeeded") return intent.amount_received;
    if (intent.status === "canceled") return "cancelled";
    return "open";
  } catch {
    return "open";
  }
}

async function settleStripePayment(input: {
  orderId: string;
  paymentIntentId: string;
  totalMinor: number;
}): Promise<{ cancelled: boolean; capturedMinor: number }> {
  if (!input.paymentIntentId) {
    if (input.totalMinor === 0) return { cancelled: true, capturedMinor: 0 };
    throw new Error("This order has no Stripe payment to capture.");
  }

  const stripe = getStripeClient();
  const intent = await stripe.paymentIntents.retrieve(input.paymentIntentId);
  const keyBase = `vault-market-${input.orderId}`;

  if (input.totalMinor === 0) {
    await releaseOrRefund(stripe, intent, keyBase);
    return { cancelled: true, capturedMinor: 0 };
  }

  if (intent.status === "requires_capture") {
    const amount = Math.min(input.totalMinor, intent.amount);
    if (amount <= 0) {
      await releaseOrRefund(stripe, intent, keyBase);
      return { cancelled: true, capturedMinor: 0 };
    }
    const captured = await stripe.paymentIntents.capture(
      intent.id,
      amount < intent.amount ? { amount_to_capture: amount } : {},
      { idempotencyKey: `${keyBase}-capture-${amount}` }
    );
    return { cancelled: false, capturedMinor: captured.amount_received || amount };
  }

  if (intent.status === "succeeded") {
    const received = intent.amount_received;
    if (received > input.totalMinor) {
      const refund = received - input.totalMinor;
      await stripe.refunds.create(
        { payment_intent: intent.id, amount: refund },
        { idempotencyKey: `${keyBase}-refund-${refund}` }
      );
      return { cancelled: false, capturedMinor: input.totalMinor };
    }
    if (received < input.totalMinor) {
      throw new Error("This payment was already captured for less than the picked total.");
    }
    return { cancelled: false, capturedMinor: received };
  }

  if (intent.status === "canceled") {
    throw new Error("The card hold was already released, so this order cannot be captured.");
  }

  throw new Error(`Payment is ${intent.status} and cannot be captured yet.`);
}

async function releaseOrRefund(stripe: Stripe, intent: Stripe.PaymentIntent, keyBase: string) {
  if (intent.status === "requires_capture") {
    await stripe.paymentIntents.cancel(
      intent.id,
      { cancellation_reason: "abandoned" },
      { idempotencyKey: `${keyBase}-cancel` }
    );
    return;
  }
  if (intent.status === "succeeded" && intent.amount_received > 0) {
    await stripe.refunds.create(
      { payment_intent: intent.id, amount: intent.amount_received },
      { idempotencyKey: `${keyBase}-refund-all` }
    );
    return;
  }
  if (intent.status === "canceled") return;
  throw new Error(`Payment cannot be released while it is ${intent.status}.`);
}

async function revertClaim(
  supabase: Awaited<ReturnType<typeof pickerDb>>,
  orderId: string,
  status: string
) {
  await supabase
    .from("foodvault_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "capturing");
}

async function finalizeOrder(input: {
  supabase: Awaited<ReturnType<typeof pickerDb>>;
  order: OrderRow;
  orderId: string;
  trackingNumber: string;
  settlement: ReturnType<typeof settlePicks>;
  currency: string;
  stockCommitted: Record<string, number>;
  cancelled: boolean;
  capturedMinor: number;
}): Promise<"updated" | "lost"> {
  await settleInventoryForPick(
    input.settlement.lines.map((line) => ({
      itemId: line.itemId,
      productId: line.productId,
      sku: line.sku,
      targetQuantity: input.cancelled ? 0 : line.picked,
      committedQuantity: input.stockCommitted[line.itemId] ?? 0,
    }))
  );

  const now = new Date().toISOString();
  const captured = minorUnitsToAmount(input.capturedMinor, input.currency);
  const goods = minorUnitsToAmount(input.settlement.goodsMinor, input.currency);
  const shipping = input.cancelled
    ? 0
    : minorUnitsToAmount(input.settlement.shippingMinor, input.currency);
  const originalSubtotal = asNumber(input.order.subtotal);
  const originalSavings = asNumber(input.order.total_savings);
  const keptSavings =
    input.cancelled || originalSubtotal <= 0
      ? 0
      : Math.round(((originalSavings * goods) / originalSubtotal) * 100) / 100;

  const payload: Record<string, unknown> = input.cancelled
    ? {
        status: "cancelled",
        subtotal: 0,
        total: 0,
        shipping_cost: 0,
        total_savings: 0,
        updated_at: now,
      }
    : {
        status: "fulfilled",
        subtotal: goods,
        total: captured,
        shipping_cost: shipping,
        total_savings: keptSavings,
        tracking_number: input.trackingNumber || null,
        fulfilled_at: now,
        updated_at: now,
      };

  let body = { ...payload };
  let data: { id: string } | null = null;
  let errorMessage: string | null = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const result = await input.supabase
      .from("foodvault_orders")
      .update(body)
      .eq("id", input.orderId)
      .eq("status", "capturing")
      .select("id")
      .maybeSingle();
    if (!result.error) {
      data = result.data;
      errorMessage = null;
      break;
    }
    errorMessage = result.error.message;
    const column =
      errorMessage.match(/Could not find the '([^']+)' column/i)?.[1] ??
      errorMessage.match(/column "([^"]+)"/i)?.[1];
    if (!column || !(column in body) || column === "status") break;
    const next = { ...body };
    delete next[column];
    body = next;
  }

  if (errorMessage) throw new Error(errorMessage);
  if (!data) return "lost";

  const adjustments = input.settlement.adjustments.map((line) => ({
    sku: line.sku,
    name: line.name,
    ordered: line.ordered,
    picked: line.picked,
  }));

  await logAuditAction(
    input.cancelled ? "cancel_vault_market_order" : "fulfill_vault_market_order",
    "foodvault_order",
    input.orderId,
    {
      trackingNumber: input.cancelled ? null : input.trackingNumber || null,
      authorizedTotal: asNumber(input.order.total),
      capturedTotal: input.cancelled ? 0 : captured,
      shipping,
      capped: input.settlement.capped,
      adjustments,
    }
  );

  revalidatePath("/admin/picker");
  revalidatePath(`/admin/picker/${input.orderId}`);
  revalidatePath(`/admin/orders/${input.orderId}/packing-slip`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/account/orders");
  await sendPickerOutcomeEmail({
    order: input.order,
    orderId: input.orderId,
    cancelled: input.cancelled,
    capturedTotal: input.cancelled ? 0 : captured,
    shippingCost: shipping,
    trackingNumber: input.trackingNumber,
    lines: input.settlement.lines.map((line) => {
      const lineTotal = minorUnitsToAmount(line.chargeMinor, input.currency);
      return {
        name: line.name,
        sku: line.sku,
        ordered: line.ordered,
        picked: line.picked,
        unitPrice: line.picked > 0 ? Math.round((lineTotal / line.picked) * 100) / 100 : 0,
        lineTotal,
      };
    }),
  });
  return "updated";
}

function orderAddressLines(order: OrderRow): string[] {
  const locality = [
    asString(order.shipping_city),
    asString(order.shipping_state),
    asString(order.shipping_postal_code),
  ]
    .filter(Boolean)
    .join(" ");
  return [
    asString(order.shipping_line1),
    asString(order.shipping_line2),
    locality,
    asString(order.shipping_country),
  ].filter(Boolean);
}

async function sendPickerOutcomeEmail(input: {
  order: OrderRow;
  orderId: string;
  cancelled: boolean;
  capturedTotal: number;
  shippingCost: number;
  trackingNumber: string;
  lines: Array<{
    name: string;
    sku: string;
    ordered: number;
    picked: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}) {
  const to = asString(input.order.shipping_email);
  const customerName = asString(input.order.shipping_name) || null;

  if (input.cancelled) {
    if (!to) {
      console.warn("[picker] Order outcome email skipped — no shipping email", {
        orderId: input.orderId,
      });
      return;
    }
    try {
      await sendSupermarketOrderCanceledEmail({
        to,
        orderId: input.orderId,
        customerName,
        releasedHold: asNumber(input.order.total),
        lines: input.lines.map((line) => ({ name: line.name, ordered: line.ordered })),
      });
    } catch (error) {
      console.error("[picker] Order outcome email failed", {
        orderId: input.orderId,
        cancelled: true,
        error: error instanceof Error ? error.message : error,
      });
    }
    return;
  }

  try {
    if (to) {
      await sendSupermarketOrderFulfilledEmail({
        to,
        orderId: input.orderId,
        customerName,
        lines: input.lines,
        shippingCost: input.shippingCost,
        capturedTotal: input.capturedTotal,
        trackingNumber: input.trackingNumber || null,
      });
    } else {
      console.warn("[picker] Packed customer email skipped — no shipping email", {
        orderId: input.orderId,
      });
    }
  } catch (error) {
    console.error("[picker] Order outcome email failed", {
      orderId: input.orderId,
      cancelled: false,
      error: error instanceof Error ? error.message : error,
    });
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const goodsSubtotal = input.lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const result = await sendAdminPackingInvoiceEmail({
      orderId: input.orderId,
      orderDate: asString(input.order.created_at) || new Date().toISOString(),
      customerName,
      customerEmail: to || null,
      customerPhone: asString(input.order.shipping_phone) || asString(input.order.phone) || null,
      addressLines: orderAddressLines(input.order),
      trackingNumber: input.trackingNumber || null,
      lines: input.lines,
      subtotal: goodsSubtotal,
      shippingCost: input.shippingCost,
      capturedTotal: input.capturedTotal,
    });
    if (!result.sent) {
      console.error("[picker] Admin packing invoice email was not sent", {
        orderId: input.orderId,
        reason: result.reason,
      });
    }
  } catch (error) {
    console.error("[picker] Admin packing invoice email failed", {
      orderId: input.orderId,
      error: error instanceof Error ? error.message : error,
    });
  }
}
