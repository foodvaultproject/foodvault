import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrowseBrandsView } from "@/components/browse-brands/BrowseBrandsView";
import {
  CONSUMER_SEARCH_PATH,
  isConsumerNavRestructureEnabled,
} from "@/lib/consumer-nav-restructure";
import { loadBrowseBrandsPageDataStatic } from "@/lib/member/browse-brands-page-static";

export const revalidate = 86400;

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
  const params = await searchParams;

  if (isConsumerNavRestructureEnabled()) {
    const redirectParams = new URLSearchParams();
    if (params.department) redirectParams.set("department", params.department);
    if (params.subcategory) redirectParams.set("subcategory", params.subcategory);
    const query = redirectParams.toString();
    redirect(query ? `${CONSUMER_SEARCH_PATH}?${query}` : CONSUMER_SEARCH_PATH);
  }

  const data = await loadBrowseBrandsPageDataStatic(params);

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
