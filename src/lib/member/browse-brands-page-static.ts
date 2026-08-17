import {
  getCachedFeaturedBrands,
  getCachedHospitalityVenues,
  getCachedSearchPublicBrands,
} from "@/lib/cache/public-directory";
import {
  BROWSE_PAGE_SIZE,
} from "@/lib/member/browse-brands";

type BrowseSearchParams = {
  department?: string;
  subcategory?: string;
};

export async function loadBrowseBrandsPageDataStatic(
  searchParams: BrowseSearchParams
) {
  const initialDepartment = searchParams.department ?? "";
  const initialSubcategory = searchParams.subcategory ?? "";

  const [featured, initial, local] = await Promise.all([
    getCachedFeaturedBrands(6),
    getCachedSearchPublicBrands({
      sort: "featured",
      department: initialDepartment || null,
      subcategory: initialSubcategory || null,
      limit: BROWSE_PAGE_SIZE,
      offset: 0,
    }),
    getCachedHospitalityVenues(BROWSE_PAGE_SIZE),
  ]);

  return {
    featured,
    initialExplore: initial.brands,
    initialTotal: initial.total,
    initialLocalExplore: local.brands,
    initialLocalTotal: local.total,
    canFavorite: false,
    favoritedPartnerIds: [] as string[],
    initialDepartment,
    initialSubcategory,
  };
}
