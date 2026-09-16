import {
  VAULT_MARKET_DEPARTMENTS,
  getVaultMarketDepartmentNode,
  getVaultMarketSpecifics,
  getVaultMarketSubcategories,
  isVaultMarketDepartment,
  type VaultMarketDepartment,
} from "@/data/vault-market-categories";
import { partnerProfileSlug } from "@/lib/member/favorites-utils";
import { formatNzPrice } from "@/lib/partner-offer";
import type { FoodVaultProduct, FoodVaultUnitPricing } from "@/types/commerce";

export type VaultMarketBrowseDepartment = {
  department: VaultMarketDepartment;
  slug: string;
  subcategories: {
    label: string;
    slug: string;
    specifics: { label: string; slug: string }[];
  }[];
};

export function catalogSlug(value: string): string {
  return partnerProfileSlug(value);
}

export function resolveProductDepartment(
  product: FoodVaultProduct
): VaultMarketDepartment {
  const category = product.category.trim();
  if (isVaultMarketDepartment(category)) return category;

  const aliased = getVaultMarketDepartmentNode(category)?.department;
  if (aliased) return aliased;

  for (const department of VAULT_MARKET_DEPARTMENTS) {
    if (getVaultMarketSubcategories(department).includes(category)) {
      return department;
    }
    if (
      product.subcategory &&
      getVaultMarketSubcategories(department).includes(product.subcategory)
    ) {
      return department;
    }
  }

  return "Pantry";
}

export function resolveProductSubcategory(product: FoodVaultProduct): string {
  if (product.subcategory?.trim()) return product.subcategory.trim();

  const department = resolveProductDepartment(product);
  const taxonomy = getVaultMarketSubcategories(department);
  if (taxonomy.includes(product.category)) return product.category;

  const fallback: Record<string, string> = {
    Condiments: "Oil, Vinegar & Condiments",
    Biscuits: "Biscuits & Crackers",
    Tea: "Tea & Milk Drinks",
  };
  return fallback[product.category] ?? taxonomy[0] ?? product.category;
}

export function resolveProductSpecific(product: FoodVaultProduct): string {
  return product.specific?.trim() ?? "";
}

export function resolveProductSlug(product: FoodVaultProduct): string {
  return product.slug?.trim() || catalogSlug(product.name) || catalogSlug(product.sku);
}

export function pantryProductPath(product: FoodVaultProduct): string {
  const department = resolveProductDepartment(product);
  const subcategory = resolveProductSubcategory(product);
  return `/pantry/${catalogSlug(department)}/${catalogSlug(subcategory)}/${resolveProductSlug(product)}`;
}

export function pantryDepartmentPath(
  department: string,
  subcategory?: string,
  specific?: string
): string {
  const params = new URLSearchParams();
  params.set("department", catalogSlug(department));
  if (subcategory) params.set("subcategory", catalogSlug(subcategory));
  if (specific) params.set("specific", catalogSlug(specific));
  return `/pantry?${params.toString()}`;
}

export function getVaultMarketBrowseDepartments(): VaultMarketBrowseDepartment[] {
  return VAULT_MARKET_DEPARTMENTS.map((department) => ({
    department,
    slug: catalogSlug(department),
    subcategories: getVaultMarketSubcategories(department).map((label) => ({
      label,
      slug: catalogSlug(label),
      specifics: getVaultMarketSpecifics(department, label).map((specific) => ({
        label: specific,
        slug: catalogSlug(specific),
      })),
    })),
  }));
}

export function deriveUnitPricing(product: FoodVaultProduct): FoodVaultUnitPricing | null {
  if (product.unit_pricing) return product.unit_pricing;

  const weight =
    product.net_weight_g ??
    Number(product.name.match(/(\d+(?:\.\d+)?)\s*g\b/i)?.[1] ?? 0);

  if (weight > 0 && product.member_price > 0) {
    return {
      price: product.member_price / (weight / 100),
      basis: "100g",
    };
  }

  const ml = Number(product.name.match(/(\d+(?:\.\d+)?)\s*ml\b/i)?.[1] ?? 0);
  if (ml > 0 && product.member_price > 0) {
    return {
      price: product.member_price / (ml / 100),
      basis: "100ml",
    };
  }

  return null;
}

export function formatUnitPrice(product: FoodVaultProduct): string | null {
  if (product.unit_price_label?.trim()) return product.unit_price_label.trim();
  const unit = deriveUnitPricing(product);
  if (!unit) return null;
  return `${formatNzPrice(unit.price)} / ${unit.basis}`;
}

export function productDiscountPercent(product: FoodVaultProduct): number {
  if (product.retail_price <= 0) return 0;
  return Math.round(
    ((product.retail_price - product.member_price) / product.retail_price) * 100
  );
}

export function isMultibuyDeal(product: FoodVaultProduct): boolean {
  return Boolean(
    product.is_multibuy &&
      (product.multibuy_quantity ?? 0) >= 2 &&
      (product.multibuy_price ?? 0) > 0
  );
}

export function formatMultibuyBadge(product: FoodVaultProduct): string | null {
  if (!isMultibuyDeal(product) || product.multibuy_quantity == null || product.multibuy_price == null) {
    return null;
  }
  return `${product.multibuy_quantity} FOR ${formatNzPrice(product.multibuy_price)}`;
}

export function multibuyBundleSavings(product: FoodVaultProduct): number {
  if (!isMultibuyDeal(product) || product.multibuy_quantity == null || product.multibuy_price == null) {
    return 0;
  }
  return Math.max(0, product.member_price * product.multibuy_quantity - product.multibuy_price);
}

export function matchesCatalogQuery(product: FoodVaultProduct, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [
    product.name,
    product.brand,
    product.sku,
    product.category,
    product.subcategory,
    product.specific,
    product.description,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
}

function catalogMatchScore(value: string | null | undefined, needle: string): number {
  if (!value) return 0;
  const hay = value.trim().toLowerCase();
  if (!hay) return 0;
  if (hay === needle) return 100;
  if (hay.startsWith(needle)) return 80;
  if (hay.split(/[^a-z0-9]+/).some((word) => word.startsWith(needle))) return 65;
  if (hay.includes(needle)) return 40;
  return 0;
}

export type CatalogSearchSuggestion =
  | { kind: "brand"; brand: string; score: number }
  | { kind: "product"; product: FoodVaultProduct; score: number };

export function suggestCatalogSearch(
  products: FoodVaultProduct[],
  query: string,
  limit = 8
): CatalogSearchSuggestion[] {
  const needle = query.trim().toLowerCase();
  if (!needle || limit <= 0) return [];

  const brands = new Map<string, number>();
  const productHits: Extract<CatalogSearchSuggestion, { kind: "product" }>[] = [];

  for (const product of products) {
    const brandScore = catalogMatchScore(product.brand, needle);
    if (brandScore > 0 && product.brand.trim()) {
      const brand = product.brand.trim();
      brands.set(brand, Math.max(brands.get(brand) ?? 0, brandScore));
    }

    const score = Math.max(
      catalogMatchScore(product.name, needle),
      brandScore * 0.9,
      catalogMatchScore(product.sku, needle) * 0.75,
      catalogMatchScore(product.category, needle) * 0.45,
      catalogMatchScore(product.subcategory, needle) * 0.45,
      catalogMatchScore(product.specific, needle) * 0.45,
      catalogMatchScore(product.description, needle) * 0.35
    );
    if (score > 0) {
      productHits.push({ kind: "product", product, score });
    }
  }

  productHits.sort(
    (a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name)
  );

  const brandHits = [...brands.entries()]
    .map(([brand, score]) => ({ kind: "brand" as const, brand, score }))
    .sort((a, b) => b.score - a.score || a.brand.localeCompare(b.brand));

  const suggestions: CatalogSearchSuggestion[] = [];
  for (const brand of brandHits) {
    if (suggestions.length >= Math.min(2, limit)) break;
    suggestions.push(brand);
  }
  for (const product of productHits) {
    if (suggestions.length >= limit) break;
    suggestions.push(product);
  }
  return suggestions;
}

export function filterCatalogProducts(
  products: FoodVaultProduct[],
  filters: { query?: string; department?: string; subcategory?: string; specific?: string }
): FoodVaultProduct[] {
  const departmentSlug = filters.department?.trim().toLowerCase() ?? "";
  const subcategorySlug = filters.subcategory?.trim().toLowerCase() ?? "";
  const specificSlug = filters.specific?.trim().toLowerCase() ?? "";

  return products.filter((product) => {
    if (!matchesCatalogQuery(product, filters.query ?? "")) return false;
    if (
      departmentSlug &&
      catalogSlug(resolveProductDepartment(product)) !== departmentSlug
    ) {
      return false;
    }
    if (
      subcategorySlug &&
      catalogSlug(resolveProductSubcategory(product)) !== subcategorySlug
    ) {
      return false;
    }
    if (specificSlug && catalogSlug(resolveProductSpecific(product)) !== specificSlug) {
      return false;
    }
    return true;
  });
}

export function findCatalogProduct(
  products: FoodVaultProduct[],
  params: { category: string; subcategory: string; slug: string }
): FoodVaultProduct | null {
  return (
    products.find((product) => {
      return (
        catalogSlug(resolveProductDepartment(product)) === params.category &&
        catalogSlug(resolveProductSubcategory(product)) === params.subcategory &&
        resolveProductSlug(product) === params.slug
      );
    }) ??
    products.find((product) => resolveProductSlug(product) === params.slug) ??
    null
  );
}

export function productGallery(product: FoodVaultProduct): string[] {
  const urls = [product.image_url, ...(product.gallery_urls ?? [])].filter(
    (url): url is string => Boolean(url)
  );
  return [...new Set(urls)];
}
