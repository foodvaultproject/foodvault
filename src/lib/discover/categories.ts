import {
  DISCOVER_CMS_CATEGORIES,
  type DiscoverCategory,
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

export function normalizeDiscoverCategory(value: string): DiscoverCategory | null {
  if ((DISCOVER_CMS_CATEGORIES as readonly string[]).includes(value)) {
    return value as DiscoverCategory;
  }
  return LEGACY_CATEGORY_MAP[value] ?? null;
}

export function isRemovedDiscoverCategory(value: string): boolean {
  return (DISCOVER_REMOVED_CATEGORIES as readonly string[]).includes(value);
}
