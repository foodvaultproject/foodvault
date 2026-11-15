import {
  DISCOVER_CMS_CATEGORIES,
  STOCKUP_DISCOVER_CATEGORIES,
  type AnyDiscoverCategory,
  type DiscoverCategory,
  type DiscoverSite,
  type StockUpDiscoverCategory,
} from "@/lib/admin/types";

export const DISCOVER_PAGE_TITLE = "What's Happening?";

/** Public section labels mapped to CMS category values. */
export const DISCOVER_PAGE_SECTIONS = [
  { category: "Saving" as const, title: "Saving", anchor: "saving" },
  { category: "Brands" as const, title: "Partners", anchor: "partners" },
  { category: "Recipes" as const, title: "Recipes", anchor: "recipes" },
  { category: "News" as const, title: "News", anchor: "news" },
] satisfies ReadonlyArray<{
  category: DiscoverCategory;
  title: string;
  anchor: string;
}>;

/** Categories removed from the public discover page. */
export const DISCOVER_REMOVED_CATEGORIES = [
  "Food Buying Guides",
  "New Brands This Week",
] as const;

const LEGACY_CATEGORY_MAP: Record<string, DiscoverCategory> = {
  "Save More Every Week": "Saving",
  "Meet Our Partners": "Brands",
  "Recipes & Inspiration": "Recipes",
};

export function categoriesForSite(site: DiscoverSite): readonly AnyDiscoverCategory[] {
  return site === "stockup" ? STOCKUP_DISCOVER_CATEGORIES : DISCOVER_CMS_CATEGORIES;
}

export function normalizeDiscoverCategory(
  value: string,
  site: DiscoverSite = "foodvault"
): AnyDiscoverCategory | null {
  if (site === "stockup") {
    if ((STOCKUP_DISCOVER_CATEGORIES as readonly string[]).includes(value)) {
      return value as StockUpDiscoverCategory;
    }
    return null;
  }

  if ((DISCOVER_CMS_CATEGORIES as readonly string[]).includes(value)) {
    return value as DiscoverCategory;
  }
  return LEGACY_CATEGORY_MAP[value] ?? null;
}

export function stockupCategoryHubPath(category: string): string | null {
  if (category === "News") return "/discover/news";
  if (category === "Savings") return "/discover/savings";
  return null;
}

export const RESERVED_DISCOVER_SLUGS = ["news", "savings"] as const;

export function isRemovedDiscoverCategory(value: string): boolean {
  return (DISCOVER_REMOVED_CATEGORIES as readonly string[]).includes(value);
}
