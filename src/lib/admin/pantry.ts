import { isSupabaseConfigured } from "@/lib/auth";
import {
  parseUnitPriceLabel,
  type PantryReportData,
} from "@/lib/admin/pantry-shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  FoodVaultInventoryBatch,
  FoodVaultNutritionFacts,
  FoodVaultProduct,
  FoodVaultUnitPricing,
} from "@/types/commerce";

export type {
  ExpiryWarningRow,
  NipMatrix,
  NipNutrientKey,
  PantryReportData,
  SlowMovingRow,
  StockOnHandRow,
} from "@/lib/admin/pantry-shared";
export {
  NIP_NUTRIENTS,
  emptyNipMatrix,
  factsFromNip,
  nipFromFacts,
  parseUnitPriceLabel,
  unitPriceLabelFromProduct,
} from "@/lib/admin/pantry-shared";

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

async function pantryClient() {
  return createAdminClient() ?? (isSupabaseConfigured() ? await createClient() : null);
}

export function mapAdminProduct(row: Record<string, unknown>): FoodVaultProduct {
  return {
    id: asString(row.id),
    sku: asString(row.sku),
    name: asString(row.name),
    brand: asString(row.brand, "FoodVault"),
    retail_price: asNumber(row.retail_price),
    member_price: asNumber(row.member_price),
    stock_quantity: Math.max(0, Math.trunc(asNumber(row.stock_quantity))),
    category: asString(row.category, "Pantry"),
    subcategory: asString(row.subcategory) || null,
    slug: asString(row.slug) || null,
    image_url: asString(row.image_url) || null,
    gallery_urls: Array.isArray(row.gallery_urls)
      ? row.gallery_urls.filter((url): url is string => typeof url === "string")
      : undefined,
    is_active: row.is_active !== false,
    description: asString(row.description) || null,
    ingredients: asString(row.ingredients) || null,
    allergens: asString(row.allergens) || null,
    nutrition_facts:
      row.nutrition_facts && typeof row.nutrition_facts === "object"
        ? (row.nutrition_facts as FoodVaultNutritionFacts)
        : null,
    origin_label: asString(row.origin_label) || null,
    unit_pricing:
      row.unit_pricing && typeof row.unit_pricing === "object"
        ? (row.unit_pricing as FoodVaultUnitPricing)
        : null,
    unit_price_label: asString(row.unit_price_label) || null,
    net_weight_g: row.net_weight_g == null ? null : asNumber(row.net_weight_g),
    health_star_rating:
      row.health_star_rating == null ? null : asNumber(row.health_star_rating),
    natural_flavours_or_colours: Boolean(row.natural_flavours_or_colours),
    bin_location: asString(row.bin_location) || null,
    barcode: asString(row.barcode) || null,
    vendor_id: asString(row.vendor_id) || null,
    wholesale_cost: row.wholesale_cost == null ? null : asNumber(row.wholesale_cost),
    created_at: asString(row.created_at) || undefined,
    updated_at: asString(row.updated_at) || null,
  };
}

export function mapInventoryBatch(row: Record<string, unknown>): FoodVaultInventoryBatch {
  return {
    id: asString(row.id),
    product_id: asString(row.product_id ?? row.foodvault_product_id),
    quantity_received: Math.trunc(asNumber(row.quantity_received ?? row.quantity)),
    unit_cost_price: asNumber(row.unit_cost_price ?? row.unit_cost),
    batch_number: asString(row.batch_number ?? row.lot_number),
    expiry_date: asString(row.expiry_date ?? row.expires_at) || null,
    created_at: asString(row.created_at) || undefined,
    updated_at: asString(row.updated_at) || null,
  };
}

export async function listAdminProducts(): Promise<FoodVaultProduct[]> {
  const supabase = await pantryClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("foodvault_products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[admin-pantry] failed to list products", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapAdminProduct(row as Record<string, unknown>));
}

export async function getAdminProductById(id: string): Promise<FoodVaultProduct | null> {
  const supabase = await pantryClient();
  if (!supabase || !id) return null;

  const { data, error } = await supabase
    .from("foodvault_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapAdminProduct(data as Record<string, unknown>);
}

export async function listInventoryBatches(): Promise<
  (FoodVaultInventoryBatch & { product_name?: string; product_sku?: string })[]
> {
  const supabase = await pantryClient();
  if (!supabase) return [];

  const [{ data: batches, error }, products] = await Promise.all([
    supabase
      .from("foodvault_inventory_batches")
      .select("*")
      .order("created_at", { ascending: false }),
    listAdminProducts(),
  ]);

  if (error) {
    console.error("[admin-pantry] failed to list batches", error.message);
    return [];
  }

  const byId = new Map(products.map((product) => [product.id, product]));
  return (batches ?? []).map((row) => {
    const batch = mapInventoryBatch(row as Record<string, unknown>);
    const product = byId.get(batch.product_id);
    return {
      ...batch,
      product_name: product?.name,
      product_sku: product?.sku,
    };
  });
}

function daysUntil(dateValue: string): number {
  const expiry = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((expiry.getTime() - today.getTime()) / 86_400_000);
}

export async function getPantryReportData(): Promise<PantryReportData> {
  const supabase = await pantryClient();
  const empty: PantryReportData = {
    soh: [],
    sohTotals: { wholesale: 0, retail: 0, units: 0 },
    slowMoving: [],
    expiry: [],
  };
  if (!supabase) return empty;

  const products = await listAdminProducts();
  const { data: batches } = await supabase.from("foodvault_inventory_batches").select("*");
  const mappedBatches = (batches ?? []).map((row) =>
    mapInventoryBatch(row as Record<string, unknown>)
  );

  const costByProduct = new Map<string, { qty: number; cost: number }>();
  for (const batch of mappedBatches) {
    const current = costByProduct.get(batch.product_id) ?? { qty: 0, cost: 0 };
    current.qty += batch.quantity_received;
    current.cost += batch.quantity_received * batch.unit_cost_price;
    costByProduct.set(batch.product_id, current);
  }

  const soh = products.map((product) => {
    const cost = costByProduct.get(product.id);
    const unitCost = cost && cost.qty > 0 ? cost.cost / cost.qty : 0;
    return {
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      soh: product.stock_quantity,
      unit_cost_price: unitCost,
      wholesale_value: product.stock_quantity * unitCost,
      retail_value: product.stock_quantity * product.member_price,
    };
  });

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data: orders } = await supabase
    .from("foodvault_orders")
    .select("id, created_at")
    .gte("created_at", since.toISOString());
  const orderIds = (orders ?? []).map((order) => asString((order as { id?: unknown }).id));

  const soldByProduct = new Map<string, number>();
  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from("foodvault_order_items")
      .select("product_id, sku, quantity")
      .in("order_id", orderIds);

    for (const item of items ?? []) {
      const record = item as Record<string, unknown>;
      const key = asString(record.product_id) || asString(record.sku);
      if (!key) continue;
      soldByProduct.set(key, (soldByProduct.get(key) ?? 0) + Math.trunc(asNumber(record.quantity)));
    }
  }

  const slowMoving = products
    .map((product) => {
      const sold =
        (soldByProduct.get(product.id) ?? 0) + (soldByProduct.get(product.sku) ?? 0);
      return {
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        stock_quantity: product.stock_quantity,
        units_sold_30d: sold,
      };
    })
    .filter((row) => row.stock_quantity > 20 && row.units_sold_30d < 5);

  const productById = new Map(products.map((product) => [product.id, product]));
  const expiry = mappedBatches
    .filter((batch) => batch.expiry_date)
    .map((batch) => {
      const product = productById.get(batch.product_id);
      const days = daysUntil(batch.expiry_date as string);
      return {
        batch_id: batch.id,
        product_id: batch.product_id,
        sku: product?.sku ?? "",
        name: product?.name ?? "Unknown product",
        batch_number: batch.batch_number,
        quantity_received: batch.quantity_received,
        expiry_date: batch.expiry_date as string,
        days_until_expiry: days,
      };
    })
    .filter((row) => row.days_until_expiry <= 90)
    .sort((a, b) => a.days_until_expiry - b.days_until_expiry);

  return {
    soh,
    sohTotals: {
      wholesale: soh.reduce((sum, row) => sum + row.wholesale_value, 0),
      retail: soh.reduce((sum, row) => sum + row.retail_value, 0),
      units: soh.reduce((sum, row) => sum + row.soh, 0),
    },
    slowMoving,
    expiry,
  };
}

export function productWritePayload(input: {
  id?: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  slug: string;
  retail_price: number;
  member_price: number;
  unit_price_label: string;
  origin_label: string;
  health_star_rating: number | null;
  natural_flavours_or_colours: boolean;
  description: string;
  ingredients: string;
  allergens: string;
  nutrition_facts: FoodVaultNutritionFacts | null;
  image_url: string;
  gallery_urls: string[];
  is_active: boolean;
  bin_location: string;
  barcode: string;
  vendor_id: string;
  wholesale_cost: number;
}): Record<string, unknown> {
  const unitPricing = parseUnitPriceLabel(input.unit_price_label);
  const payload: Record<string, unknown> = {
    sku: input.sku,
    name: input.name,
    brand: input.brand,
    category: input.category,
    subcategory: input.subcategory || null,
    slug: input.slug || null,
    retail_price: input.retail_price,
    member_price: input.member_price,
    unit_price_label: input.unit_price_label || null,
    unit_pricing: unitPricing,
    origin_label: input.origin_label || null,
    health_star_rating: input.health_star_rating,
    natural_flavours_or_colours: input.natural_flavours_or_colours,
    description: input.description || null,
    ingredients: input.ingredients || null,
    allergens: input.allergens || null,
    nutrition_facts: input.nutrition_facts,
    image_url: input.image_url || null,
    gallery_urls: input.gallery_urls.length > 0 ? input.gallery_urls : null,
    is_active: input.is_active,
    bin_location: input.bin_location || null,
    barcode: input.barcode || null,
    vendor_id: input.vendor_id || null,
    wholesale_cost: input.wholesale_cost,
    updated_at: new Date().toISOString(),
  };
  if (input.id) payload.id = input.id;
  return payload;
}

export async function writeProductRow(
  payload: Record<string, unknown>
): Promise<{ data: FoodVaultProduct | null; error: string | null }> {
  const supabase = await pantryClient();
  if (!supabase) return { data: null, error: "Supabase is not configured." };

  const attempt = async (body: Record<string, unknown>) => {
    const { id, ...fields } = body;
    const query = id
      ? supabase.from("foodvault_products").update(fields).eq("id", String(id))
      : supabase.from("foodvault_products").insert(fields);
    return query.select("*").single();
  };

  let body = { ...payload };
  let { data, error } = await attempt(body);

  for (let i = 0; i < 8 && error; i += 1) {
    const column = error.message.match(/Could not find the '([^']+)' column/i)?.[1]
      ?? error.message.match(/column "([^"]+)"/i)?.[1];
    if (!column || !(column in body)) break;
    const next = { ...body };
    delete next[column];
    body = next;
    ({ data, error } = await attempt(body));
  }

  if (error) return { data: null, error: error.message };
  return { data: mapAdminProduct(data as Record<string, unknown>), error: null };
}

export async function writeInventoryBatch(input: {
  id?: string;
  product_id: string;
  quantity_received: number;
  unit_cost_price: number;
  batch_number: string;
  expiry_date: string | null;
}): Promise<{ data: FoodVaultInventoryBatch | null; error: string | null; previousQty: number }> {
  const supabase = await pantryClient();
  if (!supabase) {
    return { data: null, error: "Supabase is not configured.", previousQty: 0 };
  }

  let previousQty = 0;
  if (input.id) {
    const { data: existing } = await supabase
      .from("foodvault_inventory_batches")
      .select("*")
      .eq("id", input.id)
      .maybeSingle();
    if (existing) {
      previousQty = mapInventoryBatch(existing as Record<string, unknown>).quantity_received;
    }
  }

  const payload: Record<string, unknown> = {
    product_id: input.product_id,
    quantity_received: input.quantity_received,
    unit_cost_price: input.unit_cost_price,
    batch_number: input.batch_number,
    expiry_date: input.expiry_date,
    updated_at: new Date().toISOString(),
  };

  const attempt = async (body: Record<string, unknown>) => {
    const query = input.id
      ? supabase.from("foodvault_inventory_batches").update(body).eq("id", input.id)
      : supabase.from("foodvault_inventory_batches").insert(body);
    return query.select("*").single();
  };

  let body = { ...payload };
  let { data, error } = await attempt(body);
  for (let i = 0; i < 6 && error; i += 1) {
    const column = error.message.match(/Could not find the '([^']+)' column/i)?.[1]
      ?? error.message.match(/column "([^"]+)"/i)?.[1];
    if (!column || !(column in body)) break;
    const next = { ...body };
    delete next[column];
    body = next;
    ({ data, error } = await attempt(body));
  }

  if (error) return { data: null, error: error.message, previousQty };
  return {
    data: mapInventoryBatch(data as Record<string, unknown>),
    error: null,
    previousQty,
  };
}

export async function applyStockDelta(productId: string, delta: number): Promise<string | null> {
  if (!delta) return null;
  const supabase = await pantryClient();
  if (!supabase) return "Supabase is not configured.";

  const { data, error } = await supabase
    .from("foodvault_products")
    .select("id, stock_quantity")
    .eq("id", productId)
    .maybeSingle();

  if (error || !data) return error?.message ?? "Product not found.";
  const next = Math.max(0, Math.trunc(asNumber((data as { stock_quantity?: unknown }).stock_quantity) + delta));
  const { error: updateError } = await supabase
    .from("foodvault_products")
    .update({ stock_quantity: next, updated_at: new Date().toISOString() })
    .eq("id", productId);
  return updateError?.message ?? null;
}
