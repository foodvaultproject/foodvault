import { createAdminClient } from "@/lib/supabase/admin";
import type {
  FoodVaultOrder,
  FoodVaultOrderItem,
  FoodVaultOrderStatus,
  FoodVaultShippingAddress,
} from "@/types/commerce";

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  const text = asString(value).trim();
  return text || null;
}

function mapShipping(row: Record<string, unknown>): FoodVaultShippingAddress | null {
  const shipping: FoodVaultShippingAddress = {
    name: asNullableString(row.shipping_name),
    line1: asNullableString(row.shipping_line1),
    line2: asNullableString(row.shipping_line2),
    city: asNullableString(row.shipping_city),
    state: asNullableString(row.shipping_state),
    postal_code: asNullableString(row.shipping_postal_code),
    country: asNullableString(row.shipping_country),
  };

  const hasValue = Object.values(shipping).some(Boolean);
  return hasValue ? shipping : null;
}

function mapOrderItem(row: Record<string, unknown>): FoodVaultOrderItem {
  return {
    id: asString(row.id),
    order_id: asString(row.order_id),
    product_id: asString(row.product_id),
    sku: asString(row.sku),
    name: asString(row.name, "Vault Market item"),
    quantity: Math.max(1, Math.trunc(asNumber(row.quantity, 1))),
    unit_price: asNumber(row.unit_price),
    line_total: asNumber(row.line_total ?? row.total_price),
  };
}

function mapOrder(
  row: Record<string, unknown>,
  items: FoodVaultOrderItem[]
): FoodVaultOrder {
  const status = asString(row.status, "paid") as FoodVaultOrderStatus;
  return {
    id: asString(row.id),
    member_id: asNullableString(row.member_id),
    status,
    subtotal: asNumber(row.subtotal),
    total: asNumber(row.total ?? row.total_amount),
    currency: asString(row.currency, "NZD").toUpperCase(),
    stripe_session_id: asNullableString(row.stripe_session_id ?? row.session_id),
    stripe_payment_intent_id: asNullableString(
      row.stripe_payment_intent_id ?? row.payment_intent_id
    ),
    total_savings: asNumber(row.total_savings),
    shipping: mapShipping(row),
    tracking_number: asNullableString(row.tracking_number),
    shipping_email: asNullableString(row.shipping_email),
    shipping_cost: asNumber(row.shipping_cost),
    created_at: asString(row.created_at),
    updated_at: asNullableString(row.updated_at),
    items,
  };
}

async function loadOrderItems(orderId: string): Promise<FoodVaultOrderItem[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  let itemResult = await admin
    .from("foodvault_order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (itemResult.error && /created_at/i.test(itemResult.error.message)) {
    itemResult = await admin
      .from("foodvault_order_items")
      .select("*")
      .eq("order_id", orderId);
  }

  return (itemResult.data ?? []).map((item) => mapOrderItem(item as Record<string, unknown>));
}

async function getPantryOrderByColumn(
  column: "stripe_session_id" | "session_id" | "stripe_payment_intent_id",
  value: string
): Promise<FoodVaultOrder | null> {
  const admin = createAdminClient();
  if (!admin || !value.trim()) return null;

  const { data, error } = await admin
    .from("foodvault_orders")
    .select("*")
    .eq(column, value)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  if (!row.id) return null;
  return mapOrder(row, await loadOrderItems(String(row.id)));
}

export async function getPantryOrderByStripeSessionId(
  sessionId: string
): Promise<FoodVaultOrder | null> {
  const byStripeId = await getPantryOrderByColumn("stripe_session_id", sessionId);
  if (byStripeId) return byStripeId;
  return getPantryOrderByColumn("session_id", sessionId);
}

export async function getPantryOrderByPaymentIntentId(
  paymentIntentId: string
): Promise<FoodVaultOrder | null> {
  return getPantryOrderByColumn("stripe_payment_intent_id", paymentIntentId);
}
