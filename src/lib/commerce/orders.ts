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
    line_total: asNumber(row.line_total),
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
    total: asNumber(row.total),
    currency: asString(row.currency, "NZD").toUpperCase(),
    stripe_session_id: asNullableString(row.stripe_session_id ?? row.session_id),
    stripe_payment_intent_id: asNullableString(
      row.stripe_payment_intent_id ?? row.payment_intent_id
    ),
    total_savings: asNumber(row.total_savings),
    shipping: mapShipping(row),
    tracking_number: asNullableString(row.tracking_number),
    created_at: asString(row.created_at),
    updated_at: asNullableString(row.updated_at),
    items,
  };
}

export async function getPantryOrderByStripeSessionId(
  sessionId: string
): Promise<FoodVaultOrder | null> {
  const admin = createAdminClient();
  if (!admin || !sessionId.trim()) return null;

  const { data: byStripeId, error: stripeIdError } = await admin
    .from("foodvault_orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  let row = byStripeId as Record<string, unknown> | null;
  if (!row && stripeIdError) {
    const { data: bySessionId } = await admin
      .from("foodvault_orders")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();
    row = (bySessionId as Record<string, unknown> | null) ?? null;
  }

  if (!row?.id) return null;

  const { data: itemRows } = await admin
    .from("foodvault_order_items")
    .select("*")
    .eq("order_id", row.id)
    .order("created_at", { ascending: true });

  return mapOrder(
    row,
    (itemRows ?? []).map((item) => mapOrderItem(item as Record<string, unknown>))
  );
}
