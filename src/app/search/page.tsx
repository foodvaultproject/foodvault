import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowseBrandsView } from "@/components/browse-brands/BrowseBrandsView";
import { loadBrowseBrandsPageDataStatic } from "@/lib/member/browse-brands-page-static";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Search Brands",
  description:
    "Search FoodVault partner brands and unlock member savings across New Zealand.",
};

export default async function SearchPage() {
  const data = await loadBrowseBrandsPageDataStatic({});

  return (
    <Suspense>
      <BrowseBrandsView
        featured={data.featured}
        initialExplore={data.initialExplore}
        initialTotal={data.initialTotal}
        canFavorite={data.canFavorite}
        favoritedPartnerIds={data.favoritedPartnerIds}
        initialDepartment={data.initialDepartment}
        initialSubcategory={data.initialSubcategory}
      />
    </Suspense>
  );
}
