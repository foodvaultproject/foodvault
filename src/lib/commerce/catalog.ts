import {
  PARTNER_CATEGORY_TAXONOMY,
  PRIMARY_DEPARTMENTS,
  type PrimaryDepartment,
} from "@/data/partner-categories";
import { partnerProfileSlug } from "@/lib/member/favorites-utils";
import { formatNzPrice } from "@/lib/partner-offer";
import type { FoodVaultProduct, FoodVaultUnitPricing } from "@/types/commerce";

export type VaultMarketBrowseDepartment = {
  department: PrimaryDepartment;
  slug: string;
  subcategories: { label: string; slug: string }[];
};

export function catalogSlug(value: string): string {
  return partnerProfileSlug(value);
}

export function resolveProductDepartment(
  product: FoodVaultProduct
): PrimaryDepartment {
  const category = product.category.trim();
  if ((PRIMARY_DEPARTMENTS as readonly string[]).includes(category)) {
    return category as PrimaryDepartment;
  }

  for (const department of PRIMARY_DEPARTMENTS) {
    if (PARTNER_CATEGORY_TAXONOMY[department].includes(category)) {
      return department;
    }
    if (
      product.subcategory &&
      PARTNER_CATEGORY_TAXONOMY[department].includes(product.subcategory)
    ) {
      return department;
    }
  }

  return "Pantry";
}

export function resolveProductSubcategory(product: FoodVaultProduct): string {
  if (product.subcategory?.trim()) return product.subcategory.trim();

  const department = resolveProductDepartment(product);
  const taxonomy = PARTNER_CATEGORY_TAXONOMY[department];
  if (taxonomy.includes(product.category)) return product.category;

  const fallback: Record<string, string> = {
    Condiments: "Oil, Vinegar & Condiments",
    Biscuits: "Biscuits & Crackers",
    Tea: "Tea & Milk Drinks",
  };
  return fallback[product.category] ?? taxonomy[0] ?? product.category;
}

export function resolveProductSlug(product: FoodVaultProduct): string {
  return product.slug?.trim() || catalogSlug(product.name) || catalogSlug(product.sku);
}

export function pantryProductPath(product: FoodVaultProduct): string {
  const department = resolveProductDepartment(product);
  const subcategory = resolveProductSubcategory(product);
  return `/pantry/${catalogSlug(department)}/${catalogSlug(subcategory)}/${resolveProductSlug(product)}`;
}

export function pantryDepartmentPath(department: string, subcategory?: string): string {
  const params = new URLSearchParams();
  params.set("department", catalogSlug(department));
  if (subcategory) params.set("subcategory", catalogSlug(subcategory));
  return `/pantry?${params.toString()}`;
}

export function getVaultMarketBrowseDepartments(): VaultMarketBrowseDepartment[] {
  return PRIMARY_DEPARTMENTS.map((department) => ({
    department,
    slug: catalogSlug(department),
    subcategories: PARTNER_CATEGORY_TAXONOMY[department].map((label) => ({
      label,
      slug: catalogSlug(label),
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

export function canRevealMultibuyDeal(
  product: FoodVaultProduct,
  memberUnlocked: boolean
): boolean {
  return memberUnlocked && isMultibuyDeal(product);
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
  return [product.name, product.brand, product.sku, product.category, product.subcategory]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
}

export function filterCatalogProducts(
  products: FoodVaultProduct[],
  filters: { query?: string; department?: string; subcategory?: string }
): FoodVaultProduct[] {
  const departmentSlug = filters.department?.trim().toLowerCase() ?? "";
  const subcategorySlug = filters.subcategory?.trim().toLowerCase() ?? "";

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
