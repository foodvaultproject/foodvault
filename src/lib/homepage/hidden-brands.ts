import type { BrandSearchResult } from "@/lib/member/browse-brands-types";

const LOCALHOST_HOMEPAGE_HIDDEN_BRAND_NAMES = new Set(["peplers gourmet ltd"]);
const LOCALHOST_HOMEPAGE_HIDDEN_BRAND_SLUGS = new Set(["peplers-gourmet-ltd"]);

/** Localhost-only brands omitted from homepage surfaces. */
export function isLocalhostHomepageBrandHidden(brand: {
  businessName: string;
  slug?: string;
}): boolean {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  if (
    LOCALHOST_HOMEPAGE_HIDDEN_BRAND_NAMES.has(brand.businessName.trim().toLowerCase())
  ) {
    return true;
  }

  const slug = brand.slug?.trim().toLowerCase();
  return slug ? LOCALHOST_HOMEPAGE_HIDDEN_BRAND_SLUGS.has(slug) : false;
}

export function filterLocalhostHomepageBrands<
  T extends { businessName: string; slug?: string },
>(brands: T[]): T[] {
  return brands.filter((brand) => !isLocalhostHomepageBrandHidden(brand));
}

export function filterLocalhostHomepageSearchResult(
  result: BrandSearchResult
): BrandSearchResult {
  const brands = filterLocalhostHomepageBrands(result.brands);
  const removedCount = result.brands.length - brands.length;

  return {
    ...result,
    brands,
    total: Math.max(0, result.total - removedCount),
  };
}
