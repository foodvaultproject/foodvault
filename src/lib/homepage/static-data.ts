import { getHomepageFaqs } from "@/data/homepage";
import {
  filterLocalhostHomepageBrands,
  filterLocalhostHomepageSearchResult,
} from "@/lib/homepage/hidden-brands";
import { VISITOR_HOMEPAGE_FEATURED_BRAND_LIMIT } from "@/lib/homepage/visitor-featured-brand-limit";
import {
  getCachedFeaturedBrands,
  getCachedHomeVaultDrops,
  getCachedHomepageFeaturedBrands,
  getCachedMembershipSettings,
  getCachedRecentBrandCards,
  getCachedSearchPublicBrands,
  getCachedTrendingThisWeekBrands,
} from "@/lib/cache/public-directory";
import { BROWSE_PAGE_SIZE } from "@/lib/member/browse-brands";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import type { MembershipSettings } from "@/lib/member/settings";
import type { HomeVaultDrop } from "@/lib/vault-drop-data";

export type StaticHomepageData = {
  initialDepartment: string;
  initialSubcategory: string;
  visitorFeaturedBrandLimit: number;
  homepageFeatured: BrandCard[];
  homepageBrowseFeatured: BrandCard[];
  homepagePartnerBrowse: {
    brands: BrandCard[];
    total: number;
  };
  homepageNewBrands: BrandCard[];
  homepageTrendingBrands: BrandCard[];
  homepageTopOffers: BrandCard[];
  homepageFaqs: ReturnType<typeof getHomepageFaqs>;
  settings: MembershipSettings;
  vaultDrops: HomeVaultDrop[];
};

export async function getStaticHomepageData(searchParams: {
  department?: string;
  subcategory?: string;
}): Promise<StaticHomepageData> {
  const initialDepartment = searchParams.department ?? "";
  const initialSubcategory = searchParams.subcategory ?? "";
  const visitorFeaturedBrandLimit = VISITOR_HOMEPAGE_FEATURED_BRAND_LIMIT;

  const [
    featured,
    settings,
    newBrands,
    topOffers,
    trendingBrands,
    browseFeatured,
    partnerBrowseInitial,
    vaultDrops,
  ] = await Promise.all([
    getCachedHomepageFeaturedBrands(visitorFeaturedBrandLimit),
    getCachedMembershipSettings(),
    getCachedRecentBrandCards(9),
    getCachedSearchPublicBrands({ sort: "highest-discount", limit: 6, offset: 0 }),
    getCachedTrendingThisWeekBrands(),
    getCachedFeaturedBrands(6),
    getCachedSearchPublicBrands({
      sort: "featured",
      department: initialDepartment || null,
      subcategory: initialSubcategory || null,
      limit: BROWSE_PAGE_SIZE,
      offset: 0,
    }),
    getCachedHomeVaultDrops(12),
  ]);

  return {
    initialDepartment,
    initialSubcategory,
    visitorFeaturedBrandLimit,
    homepageFeatured: filterLocalhostHomepageBrands(featured),
    homepageBrowseFeatured: filterLocalhostHomepageBrands(browseFeatured),
    homepagePartnerBrowse: filterLocalhostHomepageSearchResult(partnerBrowseInitial),
    homepageNewBrands: filterLocalhostHomepageBrands(newBrands),
    homepageTrendingBrands: filterLocalhostHomepageBrands(trendingBrands),
    homepageTopOffers: filterLocalhostHomepageBrands(topOffers.brands),
    homepageFaqs: getHomepageFaqs(settings),
    settings,
    vaultDrops,
  };
}
