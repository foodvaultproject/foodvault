import type Stripe from "stripe";
import { getVaultMarketProductsByIds } from "@/lib/commerce/products";
import { getPantryOrderByStripeSessionId } from "@/lib/commerce/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FoodVaultOrder, FoodVaultShippingAddress } from "@/types/commerce";

type ParsedCartLine = {
  productId: string;
  quantity: number;
};

function paymentIntentId(session: Stripe.Checkout.Session): string | null {
  if (typeof session.payment_intent === "string") return session.payment_intent;
  if (session.payment_intent && typeof session.payment_intent === "object") {
    return session.payment_intent.id;
  }
  return null;
}

function parseCartMetadata(raw: string | undefined): ParsedCartLine[] {
  if (!raw?.trim()) return [];

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.lastIndexOf(":");
      if (separator <= 0) return null;
      const productId = entry.slice(0, separator).trim();
      const quantity = Math.trunc(Number(entry.slice(separator + 1)));
      if (!productId || !Number.isFinite(quantity) || quantity < 1) return null;
      return { productId, quantity };
    })
    .filter((line): line is ParsedCartLine => line !== null);
}

function readShipping(session: Stripe.Checkout.Session): FoodVaultShippingAddress {
  const collected = session as Stripe.Checkout.Session & {
    shipping_details?: {
      name?: string | null;
      address?: Stripe.Address | null;
    } | null;
    collected_information?: {
      shipping_details?: {
        name?: string | null;
        address?: Stripe.Address | null;
      } | null;
    } | null;
  };

  const details =
    collected.shipping_details ??
    collected.collected_information?.shipping_details ??
    null;
  const address = details?.address ?? session.customer_details?.address ?? null;

  return {
    name: details?.name ?? session.customer_details?.name ?? null,
    line1: address?.line1 ?? null,
    line2: address?.line2 ?? null,
    city: address?.city ?? null,
    state: address?.state ?? null,
    postal_code: address?.postal_code ?? null,
    country: address?.country ?? null,
  };
}

function amountFromCents(value: number | null | undefined): number {
  return typeof value === "number" ? value / 100 : 0;
}

async function decrementStock(productId: string, sku: string, quantity: number) {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: byId } = await admin
    .from("foodvault_products")
    .select("id, stock_quantity")
    .eq("id", productId)
    .maybeSingle();

  let row = byId as { id: string; stock_quantity: number } | null;
  if (!row && sku) {
    const { data: bySku } = await admin
      .from("foodvault_products")
      .select("id, stock_quantity")
      .eq("sku", sku)
      .maybeSingle();
    row = bySku as { id: string; stock_quantity: number } | null;
  }

  if (!row) return;

  const nextStock = Math.max(0, Number(row.stock_quantity ?? 0) - quantity);
  await admin
    .from("foodvault_products")
    .update({ stock_quantity: nextStock })
    .eq("id", row.id);
}

export async function fulfillPantryOrderFromCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<FoodVaultOrder | null> {
  if (session.metadata?.foodvault !== "vault_market") {
    return null;
  }

  const existing = await getPantryOrderByStripeSessionId(session.id);
  if (existing) return existing;

  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Admin Supabase client unavailable for Vault Market fulfillment");
  }

  const cartLines = parseCartMetadata(session.metadata.cart_items);
  if (cartLines.length === 0) {
    throw new Error("Vault Market checkout is missing cart metadata");
  }

  const products = await getVaultMarketProductsByIds(
    cartLines.map((line) => line.productId)
  );

  const shipping = readShipping(session);
  const total = amountFromCents(session.amount_total);
  const subtotal = amountFromCents(session.amount_subtotal ?? session.amount_total);
  const totalSavings = Number(session.metadata.total_savings ?? 0);
  const memberId = session.metadata.user_id?.trim() || null;
  const intentId = paymentIntentId(session);
  const shippingCost = Number(session.metadata.shipping_cost ?? 0);

  const orderPayload = {
    member_id: memberId,
    status: "paid",
    subtotal,
    total,
    currency: (session.currency ?? "nzd").toUpperCase(),
    stripe_session_id: session.id,
    stripe_payment_intent_id: intentId,
    total_savings: Number.isFinite(totalSavings) ? totalSavings : 0,
    shipping_name: session.metadata.recipient_name?.trim() || shipping.name,
    shipping_line1: session.metadata.delivery_street?.trim() || shipping.line1,
    shipping_line2: session.metadata.delivery_suburb?.trim() || shipping.line2,
    shipping_city: session.metadata.delivery_city?.trim() || shipping.city,
    shipping_state: shipping.state,
    shipping_postal_code:
      session.metadata.delivery_postcode?.trim() || shipping.postal_code,
    shipping_country: shipping.country || "NZ",
    shipping_phone: session.metadata.recipient_phone?.trim() || null,
    shipping_email: session.metadata.recipient_email?.trim() || null,
    delivery_notes: session.metadata.delivery_notes?.trim() || null,
    shipping_cost: Number.isFinite(shippingCost) ? shippingCost : Math.max(0, total - subtotal),
  };

  let inserted = await admin
    .from("foodvault_orders")
    .insert(orderPayload)
    .select("*")
    .single();

  if (inserted.error || !inserted.data) {
    const legacyPayload = {
      member_id: orderPayload.member_id,
      status: orderPayload.status,
      subtotal: orderPayload.subtotal,
      total: orderPayload.total,
      currency: orderPayload.currency,
      stripe_session_id: orderPayload.stripe_session_id,
      stripe_payment_intent_id: orderPayload.stripe_payment_intent_id,
      total_savings: orderPayload.total_savings,
      shipping_name: orderPayload.shipping_name,
      shipping_line1: orderPayload.shipping_line1,
      shipping_line2: orderPayload.shipping_line2,
      shipping_city: orderPayload.shipping_city,
      shipping_state: orderPayload.shipping_state,
      shipping_postal_code: orderPayload.shipping_postal_code,
      shipping_country: orderPayload.shipping_country,
    };
    inserted = await admin
      .from("foodvault_orders")
      .insert(legacyPayload)
      .select("*")
      .single();
  }

  if (inserted.error && memberId) {
    inserted = await admin
      .from("foodvault_orders")
      .insert({ ...orderPayload, member_id: null })
      .select("*")
      .single();
  }

  if (inserted.error || !inserted.data) {
    const raced = await getPantryOrderByStripeSessionId(session.id);
    if (raced) return raced;
    throw new Error(inserted.error?.message ?? "Unable to create Vault Market order");
  }

  const orderId = String(inserted.data.id);
  const lineRows = cartLines.map((line) => {
    const aliases = [line.productId];
    if (line.productId.startsWith("seed-")) {
      aliases.push(line.productId.slice(5).toUpperCase());
    }
    const product = products.find(
      (entry) => aliases.includes(entry.id) || aliases.includes(entry.sku)
    );
    const unitPrice = product?.member_price ?? 0;
    return {
      order_id: orderId,
      product_id: product?.id ?? line.productId,
      sku: product?.sku ?? "",
      name: product?.name ?? "Vault Market item",
      quantity: line.quantity,
      unit_price: unitPrice,
      line_total: unitPrice * line.quantity,
    };
  });

  const { error: itemsError } = await admin
    .from("foodvault_order_items")
    .insert(lineRows);

  if (itemsError) {
    const { error: retryError } = await admin
      .from("foodvault_order_items")
      .insert(lineRows.map(({ product_id: _productId, ...rest }) => rest));
    if (retryError) {
      throw new Error(retryError.message);
    }
  }

  for (const line of lineRows) {
    await decrementStock(line.product_id, line.sku, line.quantity);
  }

  return getPantryOrderByStripeSessionId(session.id);
}
