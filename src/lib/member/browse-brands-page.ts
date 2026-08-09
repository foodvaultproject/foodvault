import { redirect } from "next/navigation";
import {
  getFeaturedBrands,
  searchPublicBrands,
  BROWSE_PAGE_SIZE,
} from "@/lib/member/browse-brands";
import { getViewerFavoriteContext } from "@/lib/member/viewer-favorites";
import { getPartnerHomeView } from "@/lib/partner-home-view";

type BrowseSearchParams = {
  department?: string;
  subcategory?: string;
};

export async function loadBrowseBrandsPageData(searchParams: BrowseSearchParams) {
  const initialDepartment = searchParams.department ?? "";
  const initialSubcategory = searchParams.subcategory ?? "";

  const { isPartner } = await getPartnerHomeView();
  if (isPartner) {
    const params = new URLSearchParams();
    if (initialDepartment) params.set("department", initialDepartment);
    if (initialSubcategory) params.set("subcategory", initialSubcategory);
    const query = params.toString();
    redirect(query ? `/?${query}` : "/");
  }

  const [featured, initial, favoriteContext] = await Promise.all([
    getFeaturedBrands(6),
    searchPublicBrands({
      sort: "featured",
      department: initialDepartment || null,
      subcategory: initialSubcategory || null,
      limit: BROWSE_PAGE_SIZE,
      offset: 0,
    }),
    getViewerFavoriteContext(),
  ]);

  return {
    featured,
    initialExplore: initial.brands,
    initialTotal: initial.total,
    canFavorite: favoriteContext.canFavorite,
    favoritedPartnerIds: favoriteContext.favoritedPartnerIds,
    initialDepartment,
    initialSubcategory,
  };
}
