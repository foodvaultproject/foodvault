import { DiscoverSection } from "@/components/home/DiscoverSection";
import { HomeFeaturedBrands } from "@/components/home/HomeFeaturedBrands";
import { HomeHero } from "@/components/home/HomeHero";
import { HomePartnerBrowseBrands } from "@/components/home/HomePartnerBrowseBrands";
import { HomeTrendingDepartmentCardsSection } from "@/components/home/HomeTrendingDepartmentCards";
import { PartnerAffiliateSetupBanner } from "@/components/partner-portal/PartnerAffiliateSetupBanner";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { HomeTrendingSection } from "@/components/home/HomeTrendingSection";
import {
  HomeCategories,
  HomePartnerBanner,
  HomePartnerQuickLinks,
  HomeWhyJoinFeatures,
} from "@/components/home/HomeSections";
import { getHomepageFaqs } from "@/data/homepage";
import { getAdminUser } from "@/lib/admin/auth";
import { getActiveMemberView } from "@/lib/member/active-member";
import { getFreeTrialMemberView } from "@/lib/member/free-trial-member";
import { getPartnerHomeView } from "@/lib/partner-home-view";
import { getMembershipSettings } from "@/lib/member/settings";
import { getViewerFavoriteContext } from "@/lib/member/viewer-favorites";
import { getDiscoverPageContent } from "@/lib/discover/queries";
import {
  BROWSE_PAGE_SIZE,
  getFeaturedBrands,
  getHomepageFeaturedBrands,
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
    discover,
    settings,
    newBrands,
    topOffers,
    trendingBrands,
    favoriteContext,
    { isActiveMember: activeMember, memberName: activeMemberName },
    { isFreeTrialMember: freeTrialMember, memberName: freeTrialMemberName },
    { isPartner, partnerName },
    adminUser,
    browseFeatured,
    partnerBrowseInitial,
  ] = await Promise.all([
    getHomepageFeaturedBrands(12),
    getDiscoverPageContent(),
    getMembershipSettings(),
    getRecentBrandCards(5),
    searchPublicBrands({ sort: "highest-discount", limit: 5, offset: 0 }),
    searchPublicBrands({ sort: "featured", limit: 5, offset: 0 }),
    getViewerFavoriteContext(),
    getActiveMemberView(),
    getFreeTrialMemberView(),
    getPartnerHomeView(),
    getAdminUser(),
    getFeaturedBrands(6),
    searchPublicBrands({
      sort: "featured",
      department: initialDepartment || null,
      subcategory: initialSubcategory || null,
      limit: BROWSE_PAGE_SIZE,
      offset: 0,
    }),
  ]);
  // Admins browsing the public homepage must match the visitor experience.
  const isActiveMember = Boolean(activeMember) && !adminUser;
  const isFreeTrialMember = Boolean(freeTrialMember) && !adminUser;
  const homepageFaqs = getHomepageFaqs(settings);

  if (isPartner) {
    return (
      <>
        <PartnerAffiliateSetupBanner variant="compact" />
        <HomeHero isPartner memberName={partnerName} />
        <HomePartnerBrowseBrands
          key={`browse-${initialDepartment}-${initialSubcategory}`}
          featured={browseFeatured}
          initialExplore={partnerBrowseInitial.brands}
          initialTotal={partnerBrowseInitial.total}
          canFavorite={favoriteContext.canFavorite}
          favoritedPartnerIds={favoriteContext.favoritedPartnerIds}
          initialDepartment={initialDepartment}
          initialSubcategory={initialSubcategory}
          exploreHeading=""
          compactSpacing
        />
        <HomeTrendingDepartmentCardsSection keepBrowseOnHomepage />
        <HomeCategories onHomepage compactSpacing />
        <HomeTrendingSection
          trending={trendingBrands.brands}
          newBrands={newBrands}
          topOffers={topOffers.brands}
          hideViewAll
          compactSpacing
        />
        <HomePartnerQuickLinks compactSpacing />
        <DiscoverSection articles={discover.homepageCards} variant="partner" compactSpacing />
      </>
    );
  }

  if (isActiveMember) {
    return (
      <>
        <HomeHero
          isActiveMember
          memberName={activeMemberName}
        />
        <HomePartnerBrowseBrands
          key={`browse-${initialDepartment}-${initialSubcategory}`}
          featured={browseFeatured}
          initialExplore={partnerBrowseInitial.brands}
          initialTotal={partnerBrowseInitial.total}
          canFavorite={favoriteContext.canFavorite}
          favoritedPartnerIds={favoriteContext.favoritedPartnerIds}
          initialDepartment={initialDepartment}
          initialSubcategory={initialSubcategory}
          exploreHeading=""
          compactSpacing
          memberHomepage
        />
        <HomeTrendingDepartmentCardsSection keepBrowseOnHomepage />
        <HomeCategories onHomepage compactSpacing />
        <HomeTrendingSection
          trending={trendingBrands.brands}
          newBrands={newBrands}
          topOffers={topOffers.brands}
          hideViewAll
          compactSpacing
        />
        <DiscoverSection articles={discover.homepageCards} compactSpacing />
      </>
    );
  }

  if (isFreeTrialMember) {
    return (
      <>
        <HomeHero
          isFreeTrial
          memberName={freeTrialMemberName}
        />
        <HomePartnerBrowseBrands
          key={`browse-${initialDepartment}-${initialSubcategory}`}
          featured={browseFeatured}
          initialExplore={partnerBrowseInitial.brands}
          initialTotal={partnerBrowseInitial.total}
          canFavorite={favoriteContext.canFavorite}
          favoritedPartnerIds={favoriteContext.favoritedPartnerIds}
          initialDepartment={initialDepartment}
          initialSubcategory={initialSubcategory}
          exploreHeading=""
          memberHomepage
        />
        <HomeTrendingDepartmentCardsSection keepBrowseOnHomepage />
        <HomeWhyJoinFeatures compactSpacing mobileTwoColumn />
        <HomeCategories onHomepage compactSpacing />
        <HomeTrendingSection
          trending={trendingBrands.brands}
          newBrands={newBrands}
          topOffers={topOffers.brands}
          hideViewAll
          compactSpacing
        />
        <DiscoverSection articles={discover.homepageCards} compactSpacing />
        <HomeFAQ faqs={homepageFaqs} compactSpacing />
      </>
    );
  }

  return (
    <>
      <HomeHero />
      <HomeFeaturedBrands
        brands={featured}
        canFavorite={favoriteContext.canFavorite}
        favoritedPartnerIds={favoriteContext.favoritedPartnerIds}
      />
      <HomeWhyJoinFeatures mobileTwoColumn />
      <HomeCategories />
      <HomeTrendingSection
        trending={trendingBrands.brands}
        newBrands={newBrands}
        topOffers={topOffers.brands}
      />
      <DiscoverSection articles={discover.homepageCards} />
      <HomeFAQ faqs={homepageFaqs} />
      <HomePartnerBanner />
    </>
  );
}
