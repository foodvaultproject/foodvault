import type Stripe from "stripe";
import { isSupermarketOrderMetadata } from "@/lib/app-mode";
import { multibuyAwareLineTotal } from "@/lib/commerce/catalog";
import { getVaultMarketProductsByIds } from "@/lib/commerce/products";
import { getPantryOrderByStripeSessionId } from "@/lib/commerce/orders";
import { sendSupermarketOrderConfirmationEmail } from "@/lib/commerce/send-supermarket-order-email";
import { sendAdminNewOrderAlertEmail } from "@/lib/email-templates/templates/supermarket/admin-new-order-alert";
import { getStripeClient } from "@/lib/payment-service/providers/stripe-client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FoodVaultOrder, FoodVaultOrderStatus, FoodVaultShippingAddress } from "@/types/commerce";

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

async function resolvePantryPaymentState(
  session: Stripe.Checkout.Session
): Promise<Extract<FoodVaultOrderStatus, "authorized" | "paid"> | null> {
  if (
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required"
  ) {
    return "paid";
  }

  if (session.payment_status !== "unpaid") return null;

  const intentId = paymentIntentId(session);
  if (!intentId) return null;

  const embedded =
    session.payment_intent && typeof session.payment_intent === "object"
      ? session.payment_intent
      : null;
  const intent = embedded ?? (await getStripeClient().paymentIntents.retrieve(intentId));
  if (intent.status === "requires_capture") return "authorized";
  if (intent.status === "succeeded") return "paid";
  return null;
}

export async function releaseReservedStock(productId: string, sku: string, quantity: number) {
  const qty = Math.trunc(quantity);
  if (qty <= 0) return;

  const admin = createAdminClient();
  if (!admin) return;

  const product = await findProductStockRow(productId, sku);
  if (!product) return;

  const { data: batches, error: batchError } = await admin
    .from("foodvault_inventory_batches")
    .select("id, quantity_remaining, quantity_received")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const latest = (batches ?? [])[0] as Record<string, unknown> | undefined;
  if (!batchError && latest?.id != null && latest.quantity_remaining != null && latest.quantity_remaining !== "") {
    const onHand = onHandFromBatch(latest);
    const { error: updateError } = await admin
      .from("foodvault_inventory_batches")
      .update({
        quantity_remaining: onHand + qty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", String(latest.id));

    if (!updateError) {
      const { data: refreshed, error: refreshError } = await admin
        .from("foodvault_inventory_batches")
        .select("quantity_remaining, quantity_received")
        .eq("product_id", product.id);
      if (!refreshError) {
        const nextStock = ((refreshed ?? []) as Record<string, unknown>[]).reduce(
          (sum, row) => sum + onHandFromBatch(row),
          0
        );
        await admin.from("foodvault_products").update({ stock_quantity: nextStock }).eq("id", product.id);
        return;
      }
    }
  }

  await admin
    .from("foodvault_products")
    .update({ stock_quantity: Math.max(0, Number(product.stock_quantity ?? 0) + qty) })
    .eq("id", product.id);
}

async function findProductStockRow(
  productId: string,
  sku: string
): Promise<{ id: string; stock_quantity: number } | null> {
  const admin = createAdminClient();
  if (!admin) return null;

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

  return row;
}

function onHandFromBatch(row: Record<string, unknown>): number {
  if (row.quantity_remaining != null && row.quantity_remaining !== "") {
    return Math.max(0, Math.trunc(Number(row.quantity_remaining)));
  }
  return Math.max(0, Math.trunc(Number(row.quantity_received ?? 0)));
}

async function decrementStock(productId: string, sku: string, quantity: number) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Admin Supabase client unavailable for stock update");
  }

  const product = await findProductStockRow(productId, sku);
  if (!product) {
    throw new Error(`Unable to update stock for ${sku || productId}`);
  }

  const sellQty = Math.max(1, Math.trunc(quantity));
  const { data: batches, error: batchError } = await admin
    .from("foodvault_inventory_batches")
    .select("id, quantity_remaining, quantity_received, created_at")
    .eq("product_id", product.id)
    .order("created_at", { ascending: true });

  if (batchError) {
    throw new Error(batchError.message);
  }

  let leftToSell = sellQty;
  const batchRows = (batches ?? []) as Record<string, unknown>[];
  const applied: { id: string; previous: number }[] = [];
  const db = admin;

  async function restoreBatches() {
    for (const change of applied) {
      await db
        .from("foodvault_inventory_batches")
        .update({
          quantity_remaining: change.previous,
          updated_at: new Date().toISOString(),
        })
        .eq("id", change.id);
    }
  }

  try {
    for (const batch of batchRows) {
      if (leftToSell <= 0) break;
      const onHand = onHandFromBatch(batch);
      if (onHand <= 0) continue;
      const take = Math.min(onHand, leftToSell);
      const nextRemaining = onHand - take;
      const batchId = String(batch.id);
      const { error: updateError } = await admin
        .from("foodvault_inventory_batches")
        .update({
          quantity_remaining: nextRemaining,
          updated_at: new Date().toISOString(),
        })
        .eq("id", batchId);

      if (updateError) {
        if (/quantity_remaining/i.test(updateError.message)) break;
        throw new Error(updateError.message);
      }
      applied.push({ id: batchId, previous: onHand });
      leftToSell -= take;
    }

    const { data: refreshed, error: refreshError } = await admin
      .from("foodvault_inventory_batches")
      .select("quantity_remaining, quantity_received")
      .eq("product_id", product.id);

    const refreshedRows = (refreshed ?? []) as Record<string, unknown>[];
    const nextStock =
      refreshError && /quantity_remaining/i.test(refreshError.message)
        ? Math.max(0, Number(product.stock_quantity ?? 0) - sellQty)
        : refreshError
          ? null
          : refreshedRows.length > 0
            ? refreshedRows.reduce((sum, row) => sum + onHandFromBatch(row), 0)
            : Math.max(0, Number(product.stock_quantity ?? 0) - sellQty);

    if (nextStock == null) {
      throw new Error(refreshError?.message ?? "Unable to recalculate stock");
    }

    const { error: productError } = await admin
      .from("foodvault_products")
      .update({ stock_quantity: nextStock })
      .eq("id", product.id);

    if (productError) {
      throw new Error(productError.message);
    }

    if (leftToSell > 0 && refreshedRows.length > 0) {
      console.error("[vault-market] Sale exceeded recorded batch stock", {
        productId: product.id,
        sku,
        requested: sellQty,
        shortfall: leftToSell,
      });
    }
  } catch (error) {
    await restoreBatches();
    throw error;
  }
}

export async function fulfillPantryOrderFromCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<FoodVaultOrder | null> {
  if (!isSupermarketOrderMetadata(session.metadata)) {
    return null;
  }

  const paymentState = await resolvePantryPaymentState(session);
  if (!paymentState) return null;

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
    status: paymentState,
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
    const lineTotal = product
      ? multibuyAwareLineTotal({
          memberPrice: product.member_price,
          quantity: line.quantity,
          isMultibuy: product.is_multibuy,
          multibuyQuantity: product.multibuy_quantity,
          multibuyPrice: product.multibuy_price,
        })
      : 0;
    const unitPrice = line.quantity > 0 ? Math.round((lineTotal / line.quantity) * 100) / 100 : 0;
    return {
      order_id: orderId,
      product_id: product?.id ?? line.productId,
      sku: product?.sku ?? "",
      name: product?.name ?? "Vault Market item",
      quantity: line.quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
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

  try {
    for (const line of lineRows) {
      await decrementStock(line.product_id, line.sku, line.quantity);
    }
  } catch (error) {
    await admin.from("foodvault_order_items").delete().eq("order_id", orderId);
    await admin.from("foodvault_orders").delete().eq("id", orderId);
    throw error;
  }

  const order = await getPantryOrderByStripeSessionId(session.id);
  if (order) {
    const recipient =
      order.shipping_email?.trim() ||
      session.metadata?.recipient_email?.trim() ||
      session.customer_details?.email?.trim() ||
      null;
    try {
      await sendSupermarketOrderConfirmationEmail({
        ...order,
        shipping_email: recipient,
      });
    } catch (error) {
      console.error("[vault-market] Order confirmation email failed", {
        orderId: order.id,
        error: error instanceof Error ? error.message : error,
      });
    }

    try {
      await sendAdminNewOrderAlertEmail({
        order: { ...order, shipping_email: recipient },
        deliveryNotes: session.metadata?.delivery_notes,
      });
    } catch (error) {
      console.error("[vault-market] Admin order alert email failed", {
        orderId: order.id,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  return order;
}
