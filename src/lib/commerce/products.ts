import { VAULT_MARKET_SEED_PRODUCTS } from "@/lib/commerce/seed-products";
import { createPublicReadClient } from "@/lib/supabase/public-read";
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

function enrichFromSeed(product: FoodVaultProduct): FoodVaultProduct {
  const seed = VAULT_MARKET_SEED_PRODUCTS.find((item) => item.sku === product.sku);
  if (!seed) return product;

  return {
    ...seed,
    ...product,
    subcategory: product.subcategory || seed.subcategory,
    slug: product.slug || seed.slug,
    image_url: product.image_url || seed.image_url,
    gallery_urls: product.gallery_urls?.length ? product.gallery_urls : seed.gallery_urls,
    description: product.description || seed.description,
    ingredients: product.ingredients || seed.ingredients,
    allergens: product.allergens || seed.allergens,
    nutrition_facts: product.nutrition_facts || seed.nutrition_facts,
    origin_label: product.origin_label || seed.origin_label,
    unit_pricing: product.unit_pricing || seed.unit_pricing,
    net_weight_g: product.net_weight_g ?? seed.net_weight_g,
    health_star_rating: product.health_star_rating ?? seed.health_star_rating,
  };
}

function mergeSeedCatalog(products: FoodVaultProduct[]): FoodVaultProduct[] {
  const enriched = products.map(enrichFromSeed);
  const seedSkus = new Set(VAULT_MARKET_SEED_PRODUCTS.map((item) => item.sku));
  if (!enriched.every((item) => seedSkus.has(item.sku))) return enriched;

  const bySku = new Map(enriched.map((item) => [item.sku, item]));
  return VAULT_MARKET_SEED_PRODUCTS.map((seed) => bySku.get(seed.sku) ?? seed);
}

function mapProduct(row: Record<string, unknown>): FoodVaultProduct | null {
  const sku = asString(row.sku);
  const name = asString(row.name);
  if (!sku || !name) return null;

  return enrichFromSeed({
    id: asString(row.id, sku),
    sku,
    name,
    brand: asString(row.brand, "FoodVault"),
    retail_price: asNumber(row.retail_price),
    member_price: asNumber(row.member_price),
    stock_quantity: Math.max(0, Math.trunc(asNumber(row.stock_quantity))),
    category: asString(row.category, "Pantry"),
    subcategory: asOptionalString(row.subcategory),
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
        : undefined,
    bin_location: asOptionalString(row.bin_location),
    created_at: asString(row.created_at) || undefined,
    updated_at: asString(row.updated_at) || null,
  });
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

  const products: FoodVaultProduct[] = [];
  const seen = new Set<string>();

  for (const id of requested) {
    const product =
      lookupAliases(id)
        .map((alias) => found.get(alias))
        .find(Boolean) ??
      VAULT_MARKET_SEED_PRODUCTS.find(
        (item) => item.id === id || item.sku === id
      );

    if (!product || seen.has(product.id)) continue;
    seen.add(product.id);
    products.push(enrichFromSeed(product));
  }

  return products;
}

export async function getActiveVaultMarketProducts(): Promise<FoodVaultProduct[]> {
  const supabase = createPublicReadClient();
  if (!supabase) return VAULT_MARKET_SEED_PRODUCTS;

  const { data, error } = await supabase
    .from("foodvault_products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[vault-market] failed to load foodvault_products", error.message);
    return VAULT_MARKET_SEED_PRODUCTS;
  }

  const products = (data ?? [])
    .map((row) => mapProduct(row as Record<string, unknown>))
    .filter((product): product is FoodVaultProduct => product !== null)
    .filter((product) => product.is_active);

  return products.length > 0 ? mergeSeedCatalog(products) : VAULT_MARKET_SEED_PRODUCTS;
}
