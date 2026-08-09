import type { Metadata } from "next";
import { BrowseBrandsView } from "@/components/browse-brands/BrowseBrandsView";
import { loadBrowseBrandsPageData } from "@/lib/member/browse-brands-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Brands",
  description:
    "Search FoodVault partner brands and unlock member savings across New Zealand.",
};

type SearchPageProps = {
  searchParams: Promise<{ department?: string; subcategory?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const data = await loadBrowseBrandsPageData(params);

  return (
    <BrowseBrandsView
      featured={data.featured}
      initialExplore={data.initialExplore}
      initialTotal={data.initialTotal}
      canFavorite={data.canFavorite}
      favoritedPartnerIds={data.favoritedPartnerIds}
      initialDepartment={data.initialDepartment}
      initialSubcategory={data.initialSubcategory}
    />
  );
}
