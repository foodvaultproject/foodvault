"use client";

import { useEffect, useState } from "react";
import { HomeFeaturedBrands } from "@/components/home/HomeFeaturedBrands";
import { HomeHero } from "@/components/home/HomeHero";
import { HomePartnerBrowseBrands } from "@/components/home/HomePartnerBrowseBrands";
import { HomeTrendingDepartmentCardsSection } from "@/components/home/HomeTrendingDepartmentCards";
import { PartnerAffiliateSetupBanner } from "@/components/partner-portal/PartnerAffiliateSetupBanner";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { HomeTrendingSection } from "@/components/home/HomeTrendingSection";
import { HomeVaultDropSection } from "@/components/home/HomeVaultDropSection";
import {
  HomeCategories,
  HomePartnerBanner,
  HomePartnerQuickLinks,
  HomeGiftsHampersBanner,
  HomeMeatPoultryBanner,
  HomeWhyJoinFeatures,
} from "@/components/home/HomeSections";
import { isCurrentUserAdminAction } from "@/lib/admin/auth";
import { getAuthSession } from "@/lib/auth";
import { resolveClientMembershipView } from "@/lib/member/client-membership";
import type { StaticHomepageData } from "@/lib/homepage/static-data";

type HomeAudience = "loading" | "guest" | "partner" | "active-member" | "free-trial";

function firstWord(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0] ?? null;
}

export function HomePageClientRouter({ data }: { data: StaticHomepageData }) {
  const [audience, setAudience] = useState<HomeAudience>("loading");
  const [memberName, setMemberName] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveAudience() {
      if (await isCurrentUserAdminAction()) {
        if (!cancelled) {
          setAudience("guest");
        }
        return;
      }

      const session = await getAuthSession();
      if (!session) {
        if (!cancelled) {
          setAudience("guest");
        }
        return;
      }

      if (session.accountType === "partner") {
        if (!cancelled) {
          setPartnerName(firstWord(session.email));
          setAudience("partner");
        }
        return;
      }

      if (session.accountType !== "member") {
        if (!cancelled) {
          setAudience("guest");
        }
        return;
      }

      const membership = await resolveClientMembershipView();
      if (cancelled) return;

      if (membership.isActiveMember) {
        setMemberName(firstWord(session.email));
        setAudience("active-member");
        return;
      }

      if (membership.isFreeTrial) {
        setMemberName(firstWord(session.email));
        setAudience("free-trial");
        return;
      }

      setAudience("guest");
    }

    void resolveAudience();

    return () => {
      cancelled = true;
    };
  }, []);

  const browseKey = `browse-${data.initialDepartment}-${data.initialSubcategory}`;

  if (audience === "loading") {
    return (
      <>
        <HomeHero />
        <HomeTrendingDepartmentCardsSection />
      </>
    );
  }

  if (audience === "partner") {
    return (
      <>
        <PartnerAffiliateSetupBanner variant="compact" />
        <HomeHero isPartner memberName={partnerName} />
        <HomePartnerBrowseBrands
          key={browseKey}
          featured={data.homepageBrowseFeatured}
          initialExplore={data.homepagePartnerBrowse.brands}
          initialTotal={data.homepagePartnerBrowse.total}
          canFavorite={false}
          favoritedPartnerIds={[]}
          initialDepartment={data.initialDepartment}
          initialSubcategory={data.initialSubcategory}
          exploreHeading=""
          compactSpacing
          partnerHomepage
        />
        <HomeTrendingDepartmentCardsSection keepBrowseOnHomepage />
        <HomeCategories onHomepage compactSpacing />
        <HomeGiftsHampersBanner keepBrowseOnHomepage compactSpacing />
        <HomeMeatPoultryBanner keepBrowseOnHomepage compactSpacing />
        <HomeTrendingSection
          trending={data.homepageTrendingBrands}
          newBrands={data.homepageNewBrands}
          topOffers={data.homepageTopOffers}
          hideViewAll
          compactSpacing
        />
        <HomePartnerQuickLinks compactSpacing />
        <HomeVaultDropSection drops={data.vaultDrops} />
      </>
    );
  }

  if (audience === "active-member") {
    return (
      <>
        <HomeHero isActiveMember memberName={memberName} />
        <HomePartnerBrowseBrands
          key={browseKey}
          featured={data.homepageBrowseFeatured}
          initialExplore={data.homepagePartnerBrowse.brands}
          initialTotal={data.homepagePartnerBrowse.total}
          canFavorite={false}
          favoritedPartnerIds={[]}
          initialDepartment={data.initialDepartment}
          initialSubcategory={data.initialSubcategory}
          exploreHeading=""
          compactSpacing
          memberHomepage
        />
        <HomeTrendingDepartmentCardsSection keepBrowseOnHomepage />
        <HomeVaultDropSection drops={data.vaultDrops} />
        <HomeMeatPoultryBanner keepBrowseOnHomepage compactSpacing />
        <HomeCategories onHomepage compactSpacing />
        <HomeGiftsHampersBanner keepBrowseOnHomepage compactSpacing />
        <HomeTrendingSection
          trending={data.homepageTrendingBrands}
          newBrands={data.homepageNewBrands}
          topOffers={data.homepageTopOffers}
          hideViewAll
          compactSpacing
        />
      </>
    );
  }

  if (audience === "free-trial") {
    return (
      <>
        <HomeHero isFreeTrial memberName={memberName} />
        <HomePartnerBrowseBrands
          key={browseKey}
          featured={data.homepageBrowseFeatured}
          initialExplore={data.homepagePartnerBrowse.brands}
          initialTotal={data.homepagePartnerBrowse.total}
          canFavorite={false}
          favoritedPartnerIds={[]}
          initialDepartment={data.initialDepartment}
          initialSubcategory={data.initialSubcategory}
          exploreHeading=""
          memberHomepage
        />
        <HomeTrendingDepartmentCardsSection keepBrowseOnHomepage />
        <HomeVaultDropSection drops={data.vaultDrops} />
        <HomeMeatPoultryBanner keepBrowseOnHomepage />
        <HomeWhyJoinFeatures compactSpacing mobileTwoColumn />
        <HomeGiftsHampersBanner keepBrowseOnHomepage compactSpacing />
        <HomeTrendingSection
          trending={data.homepageTrendingBrands}
          newBrands={data.homepageNewBrands}
          topOffers={data.homepageTopOffers}
          hideViewAll
          compactSpacing
        />
        <HomeFAQ faqs={data.homepageFaqs} compactSpacing />
      </>
    );
  }

  return (
    <>
      <HomeHero />
      <HomeTrendingDepartmentCardsSection />
      <HomeFeaturedBrands
        brands={data.homepageFeatured}
        maxBrands={data.visitorFeaturedBrandLimit}
        canFavorite={false}
        favoritedPartnerIds={[]}
      />
      <HomeVaultDropSection drops={data.vaultDrops} />
      <HomeMeatPoultryBanner />
      <HomeWhyJoinFeatures mobileTwoColumn />
      <HomeGiftsHampersBanner />
      <HomeTrendingSection
        trending={data.homepageTrendingBrands}
        newBrands={data.homepageNewBrands}
        topOffers={data.homepageTopOffers}
      />
      <HomeFAQ faqs={data.homepageFaqs} />
      <HomePartnerBanner />
    </>
  );
}
