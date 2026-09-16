import { cache } from "react";
import { createPublicReadClient } from "@/lib/supabase/public-read";
import {
  applyInventoryStock,
  fetchInventoryStockByProductId,
} from "@/lib/commerce/stock-on-hand";
import type {
  FoodVaultNutritionFacts,
  FoodVaultProduct,
  FoodVaultUnitPricing,
} from "@/types/commerce";

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asOptionalString(value: unknown): string | null | undefined {
  if (value == null) return undefined;
  return asString(value) || null;
}

function asOptionalNumber(value: unknown): number | null | undefined {
  if (value == null || value === "") return undefined;
  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function asStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const urls = value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim()));
    return urls.length > 0 ? urls : undefined;
  }
  if (typeof value === "string" && value.trim()) {
    try {
      return asStringArray(JSON.parse(value));
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function asUnitPricing(value: unknown): FoodVaultUnitPricing | null | undefined {
  const record = parseObject(value);
  if (!record) return undefined;
  const price = asNumber(record.price, Number.NaN);
  const basis = asString(record.basis);
  if (!Number.isFinite(price) || !basis) return undefined;
  return { price, basis };
}

function asNutritionFacts(value: unknown): FoodVaultNutritionFacts | null | undefined {
  const record = parseObject(value);
  if (!record || !Array.isArray(record.rows)) return undefined;

  const rows = record.rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const entry = row as Record<string, unknown>;
    const label = asString(entry.label);
    if (!label) return [];
    return [
      {
        label,
        per_serve: asString(entry.per_serve, "—"),
        per_100g: asString(entry.per_100g, "—"),
      },
    ];
  });

  if (rows.length === 0) return undefined;

  return {
    serving_size: asString(record.serving_size, "—"),
    servings_per_pack: asString(record.servings_per_pack, "—"),
    rows,
  };
}

function isActiveRow(row: Record<string, unknown>): boolean {
  if (typeof row.is_active === "boolean") return row.is_active;
  if (typeof row.active === "boolean") return row.active;
  if (typeof row.status === "string") {
    return row.status.toLowerCase() === "active";
  }
  return true;
}

function isStorefrontVisible(product: FoodVaultProduct): boolean {
  return product.is_active && product.stock_quantity > 0;
}

function mapProduct(row: Record<string, unknown>): FoodVaultProduct | null {
  const sku = asString(row.sku);
  const name = asString(row.name);
  if (!sku || !name) return null;

  return {
    id: asString(row.id, sku),
    sku,
    name,
    brand: asString(row.brand, "FoodVault"),
    retail_price: asNumber(row.retail_price),
    member_price: asNumber(row.member_price),
    stock_quantity: Math.max(0, Math.trunc(asNumber(row.stock_quantity))),
    category: asString(row.category, "Pantry"),
    subcategory: asOptionalString(row.subcategory),
    specific: asOptionalString(row.specific),
    slug: asOptionalString(row.slug),
    image_url: asString(row.image_url) || null,
    gallery_urls: asStringArray(row.gallery_urls),
    is_active: isActiveRow(row),
    description: asOptionalString(row.description),
    ingredients: asOptionalString(row.ingredients),
    allergens: asOptionalString(row.allergens),
    nutrition_facts: asNutritionFacts(row.nutrition_facts),
    origin_label: asOptionalString(row.origin_label),
    unit_pricing: asUnitPricing(row.unit_pricing),
    unit_price_label: asOptionalString(row.unit_price_label),
    net_weight_g: asOptionalNumber(row.net_weight_g),
    health_star_rating: asOptionalNumber(row.health_star_rating),
    natural_flavours_or_colours:
      typeof row.natural_flavours_or_colours === "boolean"
        ? row.natural_flavours_or_colours
        : typeof row.is_natural_flavors_colors === "boolean"
          ? row.is_natural_flavors_colors
          : undefined,
    bin_location: asOptionalString(row.bin_location),
    product_family_id: asOptionalString(row.product_family_id),
    is_multibuy: Boolean(row.is_multibuy),
    multibuy_quantity: asOptionalNumber(row.multibuy_quantity),
    multibuy_price: asOptionalNumber(row.multibuy_price),
    created_at: asString(row.created_at) || undefined,
    updated_at: asString(row.updated_at) || null,
  };
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

function lookupAliases(id: string): string[] {
  const aliases = [id];
  if (id.startsWith("seed-")) {
    aliases.push(id.slice(5).toUpperCase());
  }
  return aliases;
}

export async function getVaultMarketProductsByIds(
  ids: string[]
): Promise<FoodVaultProduct[]> {
  const requested = uniqueIds(ids);
  if (requested.length === 0) return [];

  const queryIds = uniqueIds(requested.flatMap(lookupAliases));
  const found = new Map<string, FoodVaultProduct>();
  const supabase = createPublicReadClient();

  if (supabase) {
    const [byId, bySku] = await Promise.all([
      supabase.from("foodvault_products").select("*").in("id", queryIds),
      supabase.from("foodvault_products").select("*").in("sku", queryIds),
    ]);

    if (byId.error) {
      console.error("[vault-market] failed to load checkout products", byId.error.message);
    }

    for (const row of [...(byId.data ?? []), ...(bySku.data ?? [])]) {
      const product = mapProduct(row as Record<string, unknown>);
      if (!product?.is_active) continue;
      found.set(product.id, product);
      found.set(product.sku, product);
    }
  }

  const stock = await fetchInventoryStockByProductId();
  for (const [key, product] of found) {
    found.set(key, applyInventoryStock([product], stock)[0]);
  }

  const products: FoodVaultProduct[] = [];
  const seen = new Set<string>();

  for (const id of requested) {
    const product = lookupAliases(id)
      .map((alias) => found.get(alias))
      .find(Boolean);

    if (!product || seen.has(product.id)) continue;
    seen.add(product.id);
    products.push(product);
  }

  return products;
}

function catalogDescriptionSnippet(description: string | null | undefined): string | null {
  const text = description?.replace(/\s+/g, " ").trim() ?? "";
  if (!text) return null;
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

function toCatalogProduct(product: FoodVaultProduct): FoodVaultProduct {
  return {
    ...product,
    description: catalogDescriptionSnippet(product.description),
    ingredients: null,
    allergens: null,
    nutrition_facts: null,
  };
}

export const getActiveVaultMarketProducts = cache(async function getActiveVaultMarketProducts(): Promise<FoodVaultProduct[]> {
  const supabase = createPublicReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("foodvault_products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[vault-market] failed to load foodvault_products", error.message);
    return [];
  }

  const products = (data ?? [])
    .map((row) => mapProduct(row as Record<string, unknown>))
    .filter((product): product is FoodVaultProduct => product !== null);

  const stock = await fetchInventoryStockByProductId();
  return applyInventoryStock(products, stock)
    .filter(isStorefrontVisible)
    .map(toCatalogProduct);
});

export const getVaultMarketProductById = cache(async function getVaultMarketProductById(
  id: string
): Promise<FoodVaultProduct | null> {
  const supabase = createPublicReadClient();
  if (!supabase || !id) return null;

  const { data, error } = await supabase
    .from("foodvault_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[vault-market] failed to load product detail", error.message);
    return null;
  }

  const product = mapProduct(data as Record<string, unknown>);
  if (!product) return null;
  const stock = await fetchInventoryStockByProductId();
  return applyInventoryStock([product], stock)[0] ?? null;
});
