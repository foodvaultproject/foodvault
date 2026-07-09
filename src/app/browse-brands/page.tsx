import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrowseBrandsView } from "@/components/browse-brands/BrowseBrandsView";
import {
  getFeaturedBrands,
  searchPublicBrands,
  BROWSE_PAGE_SIZE,
} from "@/lib/member/browse-brands";
import { getViewerFavoriteContext } from "@/lib/member/viewer-favorites";
import { getPartnerHomeView } from "@/lib/partner-home-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Brands",
  description:
    "Discover participating FoodVault partner brands and unlock member savings across New Zealand.",
};

type BrowseBrandsPageProps = {
  searchParams: Promise<{ department?: string; subcategory?: string }>;
};

export default async function BrowseBrandsPage({
  searchParams,
}: BrowseBrandsPageProps) {
  const { department, subcategory } = await searchParams;
  const initialDepartment = department ?? "";
  const initialSubcategory = subcategory ?? "";

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

  return (
    <BrowseBrandsView
      featured={featured}
      initialExplore={initial.brands}
      initialTotal={initial.total}
      canFavorite={favoriteContext.canFavorite}
      favoritedPartnerIds={favoriteContext.favoritedPartnerIds}
      initialDepartment={initialDepartment}
      initialSubcategory={initialSubcategory}
    />
  );
}
