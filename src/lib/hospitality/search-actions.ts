"use server";

import {
  listHospitalityLocalityOptions,
  searchHospitalityVenues,
  type HospitalitySearchParams,
} from "@/lib/hospitality/search";
import type { BrandCard, BrandSearchResult } from "@/lib/member/browse-brands-types";

export async function searchHospitalityVenuesAction(
  params: HospitalitySearchParams
): Promise<BrandSearchResult> {
  return searchHospitalityVenues(params);
}

export async function listHospitalityLocalityOptionsAction(region?: string | null) {
  return listHospitalityLocalityOptions(region);
}

export async function listFeaturedHospitalityVenuesAction(
  limit = 4
): Promise<BrandCard[]> {
  const result = await searchHospitalityVenues({
    sort: "newest",
    limit,
    offset: 0,
  });
  return result.brands;
}
