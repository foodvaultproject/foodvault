import { getHomepageFaqs } from "@/data/homepage";
import { filterLocalhostHomepageBrands } from "@/lib/homepage/hidden-brands";
import { VISITOR_HOMEPAGE_FEATURED_BRAND_LIMIT } from "@/lib/homepage/visitor-featured-brand-limit";
import {
  getCachedHomeVaultDrops,
  getCachedHomepageFeaturedBrands,
  getCachedMembershipSettings,
  getCachedRecentBrandCards,
  getCachedSearchPublicBrands,
  getCachedTrendingThisWeekBrands,
} from "@/lib/cache/public-directory";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import type { MembershipSettings } from "@/lib/member/settings";
import type { HomeVaultDrop } from "@/lib/vault-drop-data";

export type StaticHomepageData = {
  visitorFeaturedBrandLimit: number;
  homepageFeatured: BrandCard[];
  homepageNewBrands: BrandCard[];
  homepageTrendingBrands: BrandCard[];
  homepageTopOffers: BrandCard[];
  homepageFaqs: ReturnType<typeof getHomepageFaqs>;
  settings: MembershipSettings;
  vaultDrops: HomeVaultDrop[];
};

export async function getStaticHomepageData(): Promise<StaticHomepageData> {
  const visitorFeaturedBrandLimit = VISITOR_HOMEPAGE_FEATURED_BRAND_LIMIT;

  const [
    featured,
    settings,
    newBrands,
    topOffers,
    trendingBrands,
    vaultDrops,
  ] = await Promise.all([
    getCachedHomepageFeaturedBrands(visitorFeaturedBrandLimit),
    getCachedMembershipSettings(),
    getCachedRecentBrandCards(9),
    getCachedSearchPublicBrands({ sort: "highest-discount", limit: 6, offset: 0 }),
    getCachedTrendingThisWeekBrands(),
    getCachedHomeVaultDrops(12),
  ]);

  return {
    visitorFeaturedBrandLimit,
    homepageFeatured: filterLocalhostHomepageBrands(featured),
    homepageNewBrands: filterLocalhostHomepageBrands(newBrands).slice(0, 8),
    homepageTrendingBrands: filterLocalhostHomepageBrands(trendingBrands),
    homepageTopOffers: filterLocalhostHomepageBrands(topOffers.brands),
    homepageFaqs: getHomepageFaqs(settings),
    settings,
    vaultDrops,
  };
}
