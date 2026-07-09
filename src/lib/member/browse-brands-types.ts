import type { LogoCropSettings } from "@/lib/partner-logo-crop";

export type BrandSortOption =
  | "featured"
  | "highest-discount"
  | "alphabetical"
  | "newest"
  | "recently-updated";

export type BrandSearchParams = {
  search?: string | null;
  department?: string | null;
  subcategory?: string | null;
  minDiscount?: number | null;
  sort?: BrandSortOption;
  limit?: number;
  offset?: number;
};

export type BrandCard = {
  id: string;
  businessName: string;
  slug: string;
  shortDescription: string | null;
  department: string | null;
  departments: string[];
  subcategories: string[];
  offerType: string | null;
  discountLabel: string;
  discountPercent: number | null;
  bannerImageUrl: string | null;
  logoUrl: string | null;
  logoOriginalUrl: string | null;
  logoCrop: LogoCropSettings | null;
  location: string | null;
  isFeatured: boolean;
};

export type BrandSearchResult = {
  brands: BrandCard[];
  total: number;
};

export const BROWSE_PAGE_SIZE = 9;
