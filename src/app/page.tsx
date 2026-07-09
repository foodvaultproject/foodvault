import { DiscoverSection } from "@/components/home/DiscoverSection";
import { HomeFeaturedBrands } from "@/components/home/HomeFeaturedBrands";
import { HomeHero } from "@/components/home/HomeHero";
import { HomePartnerBrowseBrands } from "@/components/home/HomePartnerBrowseBrands";
import { PartnerAffiliateSetupBanner } from "@/components/partner-portal/PartnerAffiliateSetupBanner";
import { HomeTestimonialsFAQ } from "@/components/home/HomeTestimonialsFAQ";
import { HomeTrendingSection } from "@/components/home/HomeTrendingSection";
import {
  HomeCategories,
  HomeFinalCTA,
  HomePartnerBanner,
  HomePartnerQuickLinks,
  HomeWhyJoinFeatures,
} from "@/components/home/HomeSections";
import { getHomepageFaqs } from "@/data/homepage";
import { getActiveMemberView } from "@/lib/member/active-member";
import { getPartnerHomeView } from "@/lib/partner-home-view";
import { getMembershipSettings } from "@/lib/member/settings";
import { getViewerFavoriteContext } from "@/lib/member/viewer-favorites";
import { getDiscoverPageContent } from "@/lib/discover/queries";
import {
  BROWSE_PAGE_SIZE,
  getFeaturedBrands,
  getHomepageFeaturedBrands,
  getPartnerLogos,
  getRecentBrandCards,
  searchPublicBrands,
} from "@/lib/member/browse-brands";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ department?: string; subcategory?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { department, subcategory } = await searchParams;
  const initialDepartment = department ?? "";
  const initialSubcategory = subcategory ?? "";

  const [
    featured,
    logos,
    discover,
    settings,
    newBrands,
    topOffers,
    trendingBrands,
    favoriteContext,
    { isActiveMember },
    { isPartner },
    browseFeatured,
    partnerBrowseInitial,
  ] = await Promise.all([
    getHomepageFeaturedBrands(12),
    getPartnerLogos(40),
    getDiscoverPageContent(),
    getMembershipSettings(),
    getRecentBrandCards(5),
    searchPublicBrands({ sort: "highest-discount", limit: 5, offset: 0 }),
    searchPublicBrands({ sort: "featured", limit: 5, offset: 0 }),
    getViewerFavoriteContext(),
    getActiveMemberView(),
    getPartnerHomeView(),
    getFeaturedBrands(6),
    searchPublicBrands({
      sort: "featured",
      department: initialDepartment || null,
      subcategory: initialSubcategory || null,
      limit: BROWSE_PAGE_SIZE,
      offset: 0,
    }),
  ]);
  const homepageFaqs = getHomepageFaqs(settings);

  const featuredHeroPartners = featured
    .filter((brand) => brand.logoUrl || brand.logoOriginalUrl)
    .map((brand) => ({
      id: brand.id,
      businessName: brand.businessName,
      slug: brand.slug,
      logoUrl: brand.logoUrl,
      logoOriginalUrl: brand.logoOriginalUrl,
      logoCrop: brand.logoCrop,
      bannerImageUrl: brand.bannerImageUrl,
    }));

  const seen = new Set(featuredHeroPartners.map((partner) => partner.id));
  const heroPartners = [...featuredHeroPartners];

  for (const partner of logos) {
    if (heroPartners.length >= 4) break;
    if (!partner.logoUrl && !partner.logoOriginalUrl) continue;
    if (seen.has(partner.id)) continue;
    heroPartners.push(partner);
    seen.add(partner.id);
  }

  if (isPartner) {
    return (
      <>
        <PartnerAffiliateSetupBanner variant="compact" />
        <HomeHero partners={heroPartners.slice(0, 4)} isPartner />
        <HomePartnerBrowseBrands
          featured={browseFeatured}
          initialExplore={partnerBrowseInitial.brands}
          initialTotal={partnerBrowseInitial.total}
          canFavorite={favoriteContext.canFavorite}
          favoritedPartnerIds={favoriteContext.favoritedPartnerIds}
          initialDepartment={initialDepartment}
          initialSubcategory={initialSubcategory}
        />
        <HomePartnerQuickLinks />
        <DiscoverSection articles={discover.homepageCards} variant="partner" />
      </>
    );
  }

  if (isActiveMember) {
    return (
      <>
        <HomeHero partners={heroPartners.slice(0, 4)} isActiveMember />
        <HomeFeaturedBrands
          brands={featured}
          canFavorite={favoriteContext.canFavorite}
          favoritedPartnerIds={favoriteContext.favoritedPartnerIds}
        />
        <HomeCategories />
        <HomeTrendingSection
          trending={trendingBrands.brands}
          newBrands={newBrands}
          topOffers={topOffers.brands}
        />
        <DiscoverSection articles={discover.homepageCards} />
        <HomeTestimonialsFAQ faqs={homepageFaqs} showFaq={false} />
      </>
    );
  }

  return (
    <>
      <HomeHero partners={heroPartners.slice(0, 4)} />
      <HomeFeaturedBrands
        brands={featured}
        canFavorite={favoriteContext.canFavorite}
        favoritedPartnerIds={favoriteContext.favoritedPartnerIds}
      />
      <HomeWhyJoinFeatures />
      <HomeCategories />
      <HomeTrendingSection
        trending={trendingBrands.brands}
        newBrands={newBrands}
        topOffers={topOffers.brands}
      />
      <DiscoverSection articles={discover.homepageCards} />
      <HomeTestimonialsFAQ faqs={homepageFaqs} />
      <HomePartnerBanner />
      <HomeFinalCTA />
    </>
  );
}
