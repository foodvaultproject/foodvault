import { isSupabaseConfigured } from "@/lib/auth";
import { normalizeNzRegion } from "@/lib/hospitality/constants";
import {
  filterHospitalityDemoVenues,
  hospitalityVenueToBrandCard,
  isHospitalityDemoListing,
} from "@/lib/hospitality/demo-venues";
import { listNzLocalitiesForRegion } from "@/lib/hospitality/localities";
import { hospitalityListingToBrandCard } from "@/lib/hospitality/public-card";
import type { HospitalityVenueType } from "@/lib/hospitality/types";
import {
  BROWSE_PAGE_SIZE,
  type BrandSearchResult,
  type BrandSortOption,
} from "@/lib/member/browse-brands-types";
import { createPublicReadClient } from "@/lib/supabase/public-read";

export type HospitalitySearchParams = {
  region?: string | null;
  city?: string | null;
  venueType?: HospitalityVenueType | "" | null;
  sort?: BrandSortOption;
  limit?: number;
  offset?: number;
};

const HOSPITALITY_LISTING_SELECT =
  "id, slug, business_name, short_description, offer_type, discount_value, discount_percent, banner_image_url, logo_url, logo_original_url, logo_crop, gallery_image_urls, listing_model, venue_type, suburb, city, region, location, approved_at, updated_at, is_featured";

export async function searchHospitalityVenues(
  params: HospitalitySearchParams = {}
): Promise<BrandSearchResult> {
  const limit = params.limit ?? BROWSE_PAGE_SIZE;
  const offset = params.offset ?? 0;
  const region = params.region?.trim() ?? "";
  const city = params.city?.trim() ?? "";
  const venueType = params.venueType || "";

  if (!isSupabaseConfigured()) {
    const filtered = filterHospitalityDemoVenues({
      region: region || undefined,
      city: city || undefined,
      venueType: venueType || undefined,
    }).map(hospitalityVenueToBrandCard);

    const sorted = [...filtered];
    if (params.sort === "alphabetical") {
      sorted.sort((a, b) => a.businessName.localeCompare(b.businessName));
    } else if (params.sort === "highest-discount") {
      sorted.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
    }

    return {
      brands: sorted.slice(offset, offset + limit),
      total: sorted.length,
    };
  }

  const supabase = createPublicReadClient();
  if (!supabase) {
    return { brands: [], total: 0 };
  }

  let query = supabase
    .from("v_public_brand_profile")
    .select(HOSPITALITY_LISTING_SELECT, { count: "exact" })
    .eq("listing_model", "hospitality_venue");

  if (venueType) {
    query = query.eq("venue_type", venueType);
  }

  if (region === "other") {
    query = query.not("region", "in", '("Auckland","Wellington","Canterbury")');
  } else if (region) {
    const normalized = normalizeNzRegion(region) || region;
    query = query.eq("region", normalized);
  }

  if (city) {
    const term = `%${city.replace(/[%*,()]/g, "")}%`;
    query = query.or(`suburb.ilike.${term},city.ilike.${term}`);
  }

  switch (params.sort) {
    case "highest-discount":
      query = query.order("discount_percent", { ascending: false, nullsFirst: false });
      break;
    case "alphabetical":
      query = query.order("business_name", { ascending: true });
      break;
    case "newest":
      query = query.order("approved_at", { ascending: false, nullsFirst: false });
      break;
    case "recently-updated":
      query = query.order("updated_at", { ascending: false, nullsFirst: false });
      break;
    case "featured":
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("approved_at", { ascending: false, nullsFirst: false });
      break;
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error || !data) {
    return { brands: [], total: 0 };
  }

  const brands = data
    .map((row) => hospitalityListingToBrandCard(row))
    .filter((brand) => !isHospitalityDemoListing(brand.id) && !isHospitalityDemoListing(brand.slug));

  return {
    brands,
    total: count ?? data.length,
  };
}

export async function listHospitalityLocalityOptions(region?: string | null) {
  if (!region?.trim()) {
    return [];
  }

  const staticOptions = listNzLocalitiesForRegion(region);
  const values = new Set(staticOptions);

  if (!isSupabaseConfigured()) {
    for (const venue of filterHospitalityDemoVenues({
      region: region && region !== "other" ? region : undefined,
    })) {
      if (venue.hospitality.location.suburb) values.add(venue.hospitality.location.suburb);
      if (venue.hospitality.location.city) values.add(venue.hospitality.location.city);
    }
    return [...values].sort((a, b) => a.localeCompare(b));
  }

  const supabase = createPublicReadClient();
  if (!supabase) {
    return [...values].sort((a, b) => a.localeCompare(b));
  }

  let query = supabase
    .from("v_public_brand_profile")
    .select("suburb, city, region")
    .eq("listing_model", "hospitality_venue");

  if (region === "other") {
    query = query.not("region", "in", '("Auckland","Wellington","Canterbury")');
  } else if (region) {
    const normalized = normalizeNzRegion(region) || region;
    query = query.eq("region", normalized);
  }

  const { data } = await query.limit(500);
  for (const row of data ?? []) {
    const suburb = typeof row.suburb === "string" ? row.suburb.trim() : "";
    const city = typeof row.city === "string" ? row.city.trim() : "";
    if (suburb) values.add(suburb);
    if (city) values.add(city);
  }

  return [...values].sort((a, b) => a.localeCompare(b));
}
