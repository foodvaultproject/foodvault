"use server";

import {
  searchPublicBrands,
  type BrandSearchParams,
  type BrandSearchResult,
} from "@/lib/member/browse-brands";

export async function searchBrandsAction(
  params: BrandSearchParams
): Promise<BrandSearchResult> {
  return searchPublicBrands(params);
}
