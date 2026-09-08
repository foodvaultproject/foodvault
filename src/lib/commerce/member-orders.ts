import { shortOrderId } from "@/lib/admin/picker-shared";
import { getVaultMarketProductsByIds } from "@/lib/commerce/products";
import { isSupabaseConfigured } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { FoodVaultOrderStatus, FoodVaultProduct } from "@/types/commerce";

export type MemberOrderDisplayStatus =
  | "Paid"
  | "Packing"
  | "Dispatched"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export type MemberOrderReorderLine = {
  product: FoodVaultProduct;
  quantity: number;
};

export type MemberOrderHistoryItem = {
  id: string;
  shortId: string;
  createdAt: string;
  total: number;
  totalSavings: number;
  status: FoodVaultOrderStatus;
  displayStatus: MemberOrderDisplayStatus;
  trackingNumber: string | null;
  trackingUrl: string | null;
  thumbnails: string[];
  reorderLines: MemberOrderReorderLine[];
};

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function courierTrackingUrl(code: string): string {
  return `https://www.nzpost.co.nz/tools/tracking?trackid=${encodeURIComponent(code.trim())}`;
}

export function memberOrderDisplayStatus(
  status: string,
  trackingNumber?: string | null
): MemberOrderDisplayStatus {
  if (status === "cancelled") return "Cancelled";
  if (status === "refunded") return "Refunded";
  if (status === "fulfilled") return trackingNumber?.trim() ? "Dispatched" : "Packing";
  return "Paid";
}

async function ordersClient() {
  return createAdminClient() ?? (isSupabaseConfigured() ? await createClient() : null);
}

export async function getMemberVaultMarketOrders(
  memberId: string
): Promise<MemberOrderHistoryItem[]> {
  const supabase = await ordersClient();
  if (!supabase || !memberId.trim()) return [];

  const { data: orders, error } = await supabase
    .from("foodvault_orders")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[vault-market] failed to list member orders", error.message);
    return [];
  }

  const rows = (orders ?? []) as Record<string, unknown>[];
  if (rows.length === 0) return [];

  const ids = rows.map((row) => asString(row.id)).filter(Boolean);
  const { data: items } = await supabase
    .from("foodvault_order_items")
    .select("*")
    .in("order_id", ids);

  const itemsByOrder = new Map<string, Record<string, unknown>[]>();
  const productKeys = new Set<string>();
  for (const item of items ?? []) {
    const record = item as Record<string, unknown>;
    const orderId = asString(record.order_id);
    const list = itemsByOrder.get(orderId) ?? [];
    list.push(record);
    itemsByOrder.set(orderId, list);
    if (asString(record.product_id)) productKeys.add(asString(record.product_id));
    if (asString(record.sku)) productKeys.add(asString(record.sku));
  }

  const products = await getVaultMarketProductsByIds([...productKeys]);
  const productByKey = new Map<string, FoodVaultProduct>();
  for (const product of products) {
    productByKey.set(product.id, product);
    if (product.sku) productByKey.set(product.sku, product);
  }

  return rows.map((row) => {
    const orderId = asString(row.id);
    const lineRows = itemsByOrder.get(orderId) ?? [];
    const trackingNumber = asString(row.tracking_number) || null;
    const thumbnails: string[] = [];
    const reorderLines: MemberOrderReorderLine[] = [];

    for (const item of lineRows) {
      const product =
        productByKey.get(asString(item.product_id)) ?? productByKey.get(asString(item.sku));
      if (product?.image_url && thumbnails.length < 4) {
        thumbnails.push(product.image_url);
      }
      if (product && product.stock_quantity > 0) {
        reorderLines.push({
          product,
          quantity: Math.min(
            product.stock_quantity,
            Math.max(1, Math.trunc(asNumber(item.quantity, 1)))
          ),
        });
      }
    }

    return {
      id: orderId,
      shortId: shortOrderId(orderId),
      createdAt: asString(row.created_at),
      total: asNumber(row.total),
      totalSavings: asNumber(row.total_savings),
      status: asString(row.status, "paid") as FoodVaultOrderStatus,
      displayStatus: memberOrderDisplayStatus(asString(row.status, "paid"), trackingNumber),
      trackingNumber,
      trackingUrl: trackingNumber ? courierTrackingUrl(trackingNumber) : null,
      thumbnails,
      reorderLines,
    };
  });
}

export function lifetimeMemberSavings(orders: MemberOrderHistoryItem[]): number {
  return orders.reduce((sum, order) => {
    if (order.status === "cancelled" || order.status === "refunded") return sum;
    return sum + Math.max(0, order.totalSavings);
  }, 0);
}
