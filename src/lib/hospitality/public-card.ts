import { HOSPITALITY_VENUE_TYPE_LABELS } from "@/lib/hospitality/constants";
import { parseVenueType } from "@/lib/hospitality/from-partner-row";
import { formatHospitalityLocationLabel } from "@/lib/hospitality/types";
import { formatBusinessName } from "@/lib/business-name";
import {
  formatPartnerDiscountLabel,
  partnerProfileSlug,
} from "@/lib/member/favorites-utils";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import { parseLogoCrop } from "@/lib/partner-logo-crop";

export type HospitalityListingRow = {
  id: string;
  slug?: string | null;
  business_name: string | null;
  short_description?: string | null;
  offer_type?: string | null;
  discount_value?: string | null;
  discount_percent?: number | null;
  banner_image_url?: string | null;
  logo_url?: string | null;
  logo_original_url?: string | null;
  logo_crop?: unknown;
  gallery_image_urls?: string[] | null;
  venue_type?: string | null;
  suburb?: string | null;
  city?: string | null;
  location?: string | null;
};

export function hospitalityListingToBrandCard(row: HospitalityListingRow): BrandCard {
  const venueType = parseVenueType(row.venue_type);
  const locationLabel = formatHospitalityLocationLabel({
    suburb: row.suburb ?? "",
    city: row.city ?? "",
  });
  const businessName = formatBusinessName(row.business_name ?? "");
  const galleryImageUrl = Array.isArray(row.gallery_image_urls)
    ? row.gallery_image_urls.find(Boolean) ?? null
    : null;

  return {
    id: row.id,
    businessName,
    slug: row.slug || partnerProfileSlug(businessName),
    shortDescription: row.short_description ?? null,
    department: HOSPITALITY_VENUE_TYPE_LABELS[venueType],
    departments: [HOSPITALITY_VENUE_TYPE_LABELS[venueType]],
    subcategories: [],
    dietaryLifestyleAttributes: [],
    offerType: row.offer_type ?? null,
    discountLabel: formatPartnerDiscountLabel({
      discount_value: row.discount_value ?? null,
      offer_type: row.offer_type ?? null,
    }),
    discountPercent: row.discount_percent ?? null,
    bannerImageUrl: row.banner_image_url ?? null,
    galleryImageUrl,
    logoUrl: row.logo_url ?? null,
    logoOriginalUrl: row.logo_original_url ?? null,
    logoCrop: parseLogoCrop(row.logo_crop),
    location: locationLabel || row.location || null,
    isFeatured: false,
    listingModel: "hospitality_venue",
    venueType,
    locationLabel,
  };
}
