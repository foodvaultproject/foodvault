import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicReadClient } from "@/lib/supabase/public-read";

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function batchProductId(row: Record<string, unknown>): string {
  return asString(row.product_id ?? row.foodvault_product_id);
}

function batchQuantity(row: Record<string, unknown>): number {
  return Math.max(
    0,
    Math.trunc(asNumber(row.quantity_received ?? row.quantity ?? row.quantity_remaining))
  );
}

async function inventoryClient() {
  return createAdminClient() ?? createPublicReadClient();
}

/** Stock on hand keyed by product id, summed from inventory intake rows. */
export async function fetchInventoryStockByProductId(): Promise<Map<string, number>> {
  const stock = new Map<string, number>();
  const supabase = await inventoryClient();
  if (!supabase) return stock;

  const { data, error } = await supabase.from("foodvault_inventory_batches").select("*");
  if (error) {
    console.error("[vault-market] failed to load inventory batches for SOH", error.message);
    return stock;
  }

  for (const row of data ?? []) {
    const record = row as Record<string, unknown>;
    const productId = batchProductId(record);
    if (!productId) continue;
    stock.set(productId, (stock.get(productId) ?? 0) + batchQuantity(record));
  }

  return stock;
}

export function applyInventoryStock<T extends { id: string; stock_quantity: number }>(
  products: T[],
  stock: Map<string, number>
): T[] {
  if (stock.size === 0) return products;
  return products.map((product) => {
    const soh = stock.get(product.id);
    if (soh == null) return product;
    return { ...product, stock_quantity: soh };
  });
}

export async function persistProductStockQuantity(
  productId: string,
  quantity: number
): Promise<string | null> {
  const supabase = createAdminClient();
  if (!supabase || !productId) return null;

  const fields = { stock_quantity: Math.max(0, Math.trunc(quantity)) };
  const { error } = await supabase.from("foodvault_products").update(fields).eq("id", productId);
  if (!error) return null;
  if (/Could not find the 'stock_quantity' column/i.test(error.message)) {
    console.error("[vault-market] foodvault_products.stock_quantity is missing", error.message);
  }
  return error.message;
}
