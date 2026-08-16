import type { HospitalityVenueType, ListingModel } from "@/lib/hospitality/types";
import type { LogoCropSettings } from "@/lib/partner-logo-crop";

export type BrandSortOption =
  | "featured"
  | "highest-discount"
  | "alphabetical"
  | "newest"
  | "recently-updated";

export type BrandSearchParams = {
  search?: string | null;
  /** @deprecated Prefer `departments` */
  department?: string | null;
  /** @deprecated Prefer `subcategories` */
  subcategory?: string | null;
  /** @deprecated Prefer `dietaryLifestyles` */
  dietaryLifestyle?: string | null;
  departments?: string[];
  subcategories?: string[];
  dietaryLifestyles?: string[];
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
  dietaryLifestyleAttributes: string[];
  offerType: string | null;
  discountLabel: string;
  discountPercent: number | null;
  bannerImageUrl: string | null;
  /** First gallery image for homepage new-brand tiles. */
  galleryImageUrl: string | null;
  logoUrl: string | null;
  logoOriginalUrl: string | null;
  logoCrop: LogoCropSettings | null;
  location: string | null;
  isFeatured: boolean;
  listingModel?: ListingModel;
  venueType?: HospitalityVenueType;
  locationLabel?: string | null;
};

export type BrandSearchResult = {
  brands: BrandCard[];
  total: number;
};

export const BROWSE_PAGE_SIZE = 9;
