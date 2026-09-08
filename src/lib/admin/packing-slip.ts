import { isSupabaseConfigured } from "@/lib/auth";
import { compareBinLocation, displayBinLocation, shortOrderId } from "@/lib/admin/picker-shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PackingSlipLine = {
  sku: string;
  name: string;
  quantity: number;
  binLocation: string;
  unitPrice: number;
  lineTotal: number;
};

export type PackingSlipOrder = {
  id: string;
  shortId: string;
  createdAt: string;
  customerName: string;
  addressLines: string[];
  trackingNumber: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  totalSavings: number;
  lines: PackingSlipLine[];
};

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

async function packingClient() {
  return createAdminClient() ?? (isSupabaseConfigured() ? await createClient() : null);
}

function addressLines(row: Record<string, unknown>): string[] {
  const locality = [asString(row.shipping_city), asString(row.shipping_state), asString(row.shipping_postal_code)]
    .filter(Boolean)
    .join(" ");
  return [
    asString(row.shipping_line1),
    asString(row.shipping_line2),
    locality,
    asString(row.shipping_country),
  ].filter(Boolean);
}

export async function getPackingSlipOrder(orderId: string): Promise<PackingSlipOrder | null> {
  const supabase = await packingClient();
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
    const { data } = await supabase.from("foodvault_products").select("id, sku, bin_location").in("id", productIds);
    for (const product of data ?? []) {
      const record = product as Record<string, unknown>;
      products.set(asString(record.id), record);
      if (asString(record.sku)) products.set(asString(record.sku), record);
    }
  }
  if (skus.length > 0) {
    const { data } = await supabase.from("foodvault_products").select("id, sku, bin_location").in("sku", skus);
    for (const product of data ?? []) {
      const record = product as Record<string, unknown>;
      products.set(asString(record.id), record);
      if (asString(record.sku)) products.set(asString(record.sku), record);
    }
  }

  const lines = lineRows
    .map((item) => {
      const product = products.get(asString(item.product_id)) ?? products.get(asString(item.sku)) ?? null;
      const quantity = Math.max(1, Math.trunc(asNumber(item.quantity, 1)));
      const unitPrice = asNumber(item.unit_price);
      return {
        sku: asString(item.sku) || asString(product?.sku) || "—",
        name: asString(item.name, "Vault Market item"),
        quantity,
        binLocation: displayBinLocation(asString(product?.bin_location)),
        unitPrice,
        lineTotal: asNumber(item.line_total, unitPrice * quantity),
      };
    })
    .sort((a, b) => compareBinLocation(a.binLocation, b.binLocation) || a.name.localeCompare(b.name));

  const subtotal = asNumber(row.subtotal);
  const total = asNumber(row.total);
  const storedShipping = asNumber(row.shipping_cost, Number.NaN);

  return {
    id: asString(row.id),
    shortId: shortOrderId(asString(row.id)),
    createdAt: asString(row.created_at),
    customerName: asString(row.shipping_name, "Member order"),
    addressLines: addressLines(row),
    trackingNumber: asString(row.tracking_number) || null,
    subtotal,
    shippingCost: Number.isFinite(storedShipping) ? storedShipping : Math.max(0, total - subtotal),
    total,
    totalSavings: asNumber(row.total_savings),
    lines,
  };
}
