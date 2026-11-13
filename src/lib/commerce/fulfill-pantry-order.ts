import type Stripe from "stripe";
import { isSupermarketOrderMetadata } from "@/lib/app-mode";
import { multibuyAwareLineTotal, offerPrice } from "@/lib/commerce/catalog";
import { getVaultMarketProductsByIds } from "@/lib/commerce/products";
import {
  getPantryOrderByPaymentIntentId,
  getPantryOrderByStripeSessionId,
} from "@/lib/commerce/orders";
import {
  sendPantryPaymentFailedEmails,
  sendSavedOrderEmails,
} from "@/lib/commerce/send-supermarket-order-email";
import { getStripeClient } from "@/lib/payment-service/providers/stripe-client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FoodVaultOrder, FoodVaultOrderStatus, FoodVaultShippingAddress } from "@/types/commerce";

type ParsedCartLine = {
  productId: string;
  quantity: number;
};

function stripeCheckoutEmail(session: Stripe.Checkout.Session): string | null {
  return session.customer_details?.email?.trim() || session.metadata?.recipient_email?.trim() || null;
}

async function accountEmailForSession(session: Stripe.Checkout.Session): Promise<string | null> {
  const userId = session.metadata?.user_id?.trim();
  if (!userId) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  try {
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error) return null;
    return data.user?.email?.trim() || null;
  } catch {
    return null;
  }
}

async function notifySavedPantryOrder(order: FoodVaultOrder, session: Stripe.Checkout.Session) {
  await sendSavedOrderEmails(order, {
    stripeEmail: stripeCheckoutEmail(session),
    accountEmail: await accountEmailForSession(session),
  });
}

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
    await updateById("foodvault_inventory_batches", String(latest.id), {
      quantity_remaining: onHand + qty,
      updated_at: new Date().toISOString(),
    });
    await writeProductStockFromBatches(product.id, Math.max(0, Number(product.stock_quantity ?? 0) + qty));
    return;
  }

  await updateById("foodvault_products", product.id, {
    stock_quantity: Math.max(0, Number(product.stock_quantity ?? 0) + qty),
  });
}

/** Move on-hand stock to the quantity that was actually captured. */
export async function settleInventoryForPick(
  lines: Array<{
    itemId: string;
    productId: string;
    sku: string;
    targetQuantity: number;
    committedQuantity: number;
  }>
) {
  for (const line of lines) {
    const target = Math.max(0, Math.trunc(line.targetQuantity));
    const committed = Math.max(0, Math.trunc(line.committedQuantity));
    const delta = target - committed;
    if (delta > 0) {
      await decrementStock(line.productId, line.sku, delta);
    } else if (delta < 0) {
      await releaseReservedStock(line.productId, line.sku, -delta);
    }
    if (line.itemId && (delta !== 0 || committed !== target)) {
      await setQuantityCommitted(line.itemId, target);
    }
  }
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

function missingColumn(message: string): string | null {
  const labelled = message.match(/Could not find the '([^']+)' column/i)?.[1];
  if (labelled) return labelled;
  const absent = message.match(/column "?([\w.]+)"? does not exist/i)?.[1];
  return absent?.split(".").pop() ?? null;
}

/** Insert rows, dropping columns the live table does not have yet. */
async function insertFlexible(
  table: "foodvault_orders" | "foodvault_order_items",
  rows: Record<string, unknown> | Record<string, unknown>[]
) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Admin Supabase client unavailable for Vault Market fulfillment");
  }

  const list = (Array.isArray(rows) ? rows : [rows]).map((row) => ({ ...row }));
  let lastError = `Unable to save ${table}`;
  let clearedMember = false;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const result = await admin.from(table).insert(list).select("*");
    if (!result.error && result.data) {
      return result.data as Record<string, unknown>[];
    }

    lastError = result.error?.message ?? lastError;
    const column = missingColumn(lastError);
    if (column && list.some((row) => Object.prototype.hasOwnProperty.call(row, column))) {
      for (const row of list) delete row[column];
      continue;
    }

    if (!clearedMember && /foreign key|violates/i.test(lastError)) {
      const foreignColumn = ["user_id", "member_id", "product_id"].find(
        (column) =>
          new RegExp(column, "i").test(lastError) &&
          list.some((row) => row[column] != null && row[column] !== "")
      );
      if (foreignColumn) {
        clearedMember = foreignColumn !== "product_id";
        for (const row of list) row[foreignColumn] = null;
        continue;
      }
    }

    break;
  }

  throw new Error(lastError);
}

function onHandFromBatch(row: Record<string, unknown>): number {
  if (row.quantity_remaining != null && row.quantity_remaining !== "") {
    return Math.max(0, Math.trunc(Number(row.quantity_remaining)));
  }
  return Math.max(0, Math.trunc(Number(row.quantity_received ?? 0)));
}

async function updateById(
  table: "foodvault_inventory_batches" | "foodvault_order_items" | "foodvault_products",
  id: string,
  fields: Record<string, unknown>
) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Admin Supabase client unavailable for stock update");
  }

  let body = { ...fields };
  let lastError = `Unable to update ${table}`;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (Object.keys(body).length === 0) break;
    const result = await admin.from(table).update(body).eq("id", id);
    if (!result.error) return;
    lastError = result.error.message;
    const column = missingColumn(lastError);
    if (
      !column ||
      !(column in body) ||
      column === "quantity_remaining" ||
      column === "stock_quantity" ||
      column === "quantity_committed"
    ) {
      break;
    }
    const next = { ...body };
    delete next[column];
    body = next;
  }

  throw new Error(lastError);
}

async function setQuantityCommitted(itemId: string, quantity: number) {
  await updateById("foodvault_order_items", itemId, {
    quantity_committed: Math.max(0, Math.trunc(quantity)),
  });
}

async function writeProductStockFromBatches(productId: string, fallback: number) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Admin Supabase client unavailable for stock update");
  }

  const { data: refreshed, error: refreshError } = await admin
    .from("foodvault_inventory_batches")
    .select("quantity_remaining, quantity_received")
    .eq("product_id", productId);

  if (refreshError && !/quantity_remaining/i.test(refreshError.message)) {
    throw new Error(refreshError.message);
  }

  const refreshedRows = (refreshed ?? []) as Record<string, unknown>[];
  const nextStock =
    refreshError || refreshedRows.length === 0
      ? Math.max(0, Math.trunc(fallback))
      : refreshedRows.reduce((sum, row) => sum + onHandFromBatch(row), 0);

  await updateById("foodvault_products", productId, { stock_quantity: nextStock });
  return { nextStock, refreshedRows, refreshError };
}

async function reserveOrderedStock(itemId: string, productId: string, sku: string, quantity: number) {
  const qty = Math.trunc(quantity);
  if (qty <= 0) return;
  await decrementStock(productId, sku, qty);
  try {
    if (itemId) await setQuantityCommitted(itemId, qty);
  } catch (error) {
    await releaseReservedStock(productId, sku, qty);
    throw error;
  }
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

  const sellQty = Math.trunc(quantity);
  if (sellQty <= 0) return;
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

  async function restoreBatches() {
    for (const change of applied) {
      await updateById("foodvault_inventory_batches", change.id, {
        quantity_remaining: change.previous,
        updated_at: new Date().toISOString(),
      });
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
      await updateById("foodvault_inventory_batches", batchId, {
        quantity_remaining: nextRemaining,
        updated_at: new Date().toISOString(),
      });
      applied.push({ id: batchId, previous: onHand });
      leftToSell -= take;
    }

    const { refreshedRows } = await writeProductStockFromBatches(
      product.id,
      Math.max(0, Number(product.stock_quantity ?? 0) - sellQty)
    );

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
  if (existing) {
    const fresh = (await getPantryOrderByStripeSessionId(session.id)) ?? existing;
    await notifySavedPantryOrder(fresh, session);
    return fresh;
  }

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

  const shippingAddress = {
    name: session.metadata.recipient_name?.trim() || shipping.name,
    line1: session.metadata.delivery_street?.trim() || shipping.line1,
    line2: session.metadata.delivery_suburb?.trim() || shipping.line2,
    city: session.metadata.delivery_city?.trim() || shipping.city,
    state: shipping.state,
    postal_code: session.metadata.delivery_postcode?.trim() || shipping.postal_code,
    country: shipping.country || "NZ",
    phone: session.metadata.recipient_phone?.trim() || null,
    email: session.metadata.recipient_email?.trim() || null,
  };

  const orderPayload = {
    user_id: memberId,
    member_id: memberId,
    status: paymentState,
    subtotal,
    total,
    total_amount: total,
    savings_amount: Number.isFinite(totalSavings) ? totalSavings : 0,
    shipping_address: shippingAddress,
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

  let insertedRows: Record<string, unknown>[];
  try {
    insertedRows = await insertFlexible("foodvault_orders", orderPayload);
  } catch (error) {
    const raced = await getPantryOrderByStripeSessionId(session.id);
    if (raced) {
      const fresh = (await getPantryOrderByStripeSessionId(session.id)) ?? raced;
      await notifySavedPantryOrder(fresh, session);
      return fresh;
    }
    throw error;
  }

  const orderId = String(insertedRows[0]?.id ?? "");
  if (!orderId) {
    throw new Error("Unable to create Vault Market order");
  }
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
          memberPrice: offerPrice(product),
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
      total_price: lineTotal,
      line_total: lineTotal,
    };
  });

  let insertedItems: Record<string, unknown>[] = [];
  try {
    insertedItems = await insertFlexible("foodvault_order_items", lineRows);
  } catch (error) {
    await admin.from("foodvault_order_items").delete().eq("order_id", orderId);
    await admin.from("foodvault_orders").delete().eq("id", orderId);
    throw error;
  }

  try {
    for (const row of insertedItems) {
      await reserveOrderedStock(
        String(row.id ?? ""),
        String(row.product_id ?? ""),
        String(row.sku ?? ""),
        Math.trunc(Number(row.quantity ?? 0))
      );
    }
  } catch (error) {
    console.error("[vault-market] Stock was not reduced for a paid order", {
      orderId,
      error: error instanceof Error ? error.message : error,
    });
  }

  const order = await getPantryOrderByStripeSessionId(session.id);
  if (order) {
    const recipient =
      order.shipping_email?.trim() ||
      stripeCheckoutEmail(session) ||
      (await accountEmailForSession(session)) ||
      null;
    const savedShipping = order.shipping;
    await notifySavedPantryOrder(
      {
        ...order,
        shipping_email: recipient,
      },
      session
    );
    const notice: FoodVaultOrder = {
      ...order,
      shipping_email: recipient,
      subtotal: order.subtotal > 0 ? order.subtotal : subtotal,
      total: order.total > 0 ? order.total : total,
      total_savings:
        (order.total_savings ?? 0) > 0
          ? order.total_savings
          : Number.isFinite(totalSavings)
            ? totalSavings
            : 0,
      shipping_cost:
        (order.shipping_cost ?? 0) > 0
          ? order.shipping_cost
          : Number.isFinite(shippingCost)
            ? shippingCost
            : 0,
      shipping: savedShipping ?? {
        name: (orderPayload.shipping_name as string | null) ?? null,
        line1: (orderPayload.shipping_line1 as string | null) ?? null,
        line2: (orderPayload.shipping_line2 as string | null) ?? null,
        city: (orderPayload.shipping_city as string | null) ?? null,
        state: (orderPayload.shipping_state as string | null) ?? null,
        postal_code: (orderPayload.shipping_postal_code as string | null) ?? null,
        country: (orderPayload.shipping_country as string | null) ?? null,
      },
    };
    return notice;
  }

  return order;
}

const OPEN_PAYMENT_STATUSES = new Set(["authorized", "pending", "capturing"]);

export async function handlePantryPaymentFailure(paymentIntentId: string) {
  const intentId = paymentIntentId.trim();
  if (!intentId) return null;

  const order = await getPantryOrderByPaymentIntentId(intentId);
  if (!order || !OPEN_PAYMENT_STATUSES.has(order.status)) {
    return order;
  }

  const admin = createAdminClient();
  if (!admin) return order;

  const { data, error } = await admin
    .from("foodvault_orders")
    .update({ status: "cancelled" })
    .eq("id", order.id)
    .in("status", ["authorized", "pending", "capturing"])
    .select("id")
    .maybeSingle();

  if (error || !data) return order;

  for (const item of order.items ?? []) {
    try {
      await releaseReservedStock(item.product_id, item.sku, item.quantity);
    } catch (releaseError) {
      console.error("[vault-market] Could not release stock after payment failure", {
        orderId: order.id,
        productId: item.product_id,
        error: releaseError instanceof Error ? releaseError.message : releaseError,
      });
    }
  }

  const cancelled: FoodVaultOrder = { ...order, status: "cancelled" };
  try {
    await sendPantryPaymentFailedEmails(cancelled);
  } catch (emailError) {
    console.error("[vault-market] Payment-failed notification failed", {
      orderId: order.id,
      error: emailError instanceof Error ? emailError.message : emailError,
    });
  }

  return cancelled;
}
