"use client";

import { useEffect, useState } from "react";
import { HomeFeaturedBrands } from "@/components/home/HomeFeaturedBrands";
import { HomeHero } from "@/components/home/HomeHero";
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
import { getPartnerListing } from "@/lib/partner-data";
import type { StaticHomepageData } from "@/lib/homepage/static-data";

type HomeAudience = "loading" | "guest" | "partner" | "active-member" | "free-trial";

export function HomePageClientRouter({ data }: { data: StaticHomepageData }) {
  const [audience, setAudience] = useState<HomeAudience>("loading");
  const [partnerGalleryImages, setPartnerGalleryImages] = useState<string[]>([]);

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
        const listing = await getPartnerListing(session.id);
        if (!cancelled) {
          setPartnerGalleryImages((listing?.galleryImageUrls ?? []).filter(Boolean).slice(0, 3));
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
        setAudience("active-member");
        return;
      }

      if (membership.isFreeTrial) {
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

  if (audience === "loading") {
    return (
      <>
        <HomeHero collageImages={data.heroBrandGalleryImages} />
        <HomeTrendingDepartmentCardsSection />
      </>
    );
  }

  if (audience === "partner") {
    return (
      <>
        <PartnerAffiliateSetupBanner variant="compact" />
        <HomeHero variant="partner" collageImages={partnerGalleryImages} />
        <HomeTrendingDepartmentCardsSection />
        <HomeGiftsHampersBanner compactSpacing />
        <HomePartnerQuickLinks compactSpacing />
        <HomeMeatPoultryBanner compactSpacing />
        <HomeTrendingSection
          trending={data.homepageTrendingBrands}
          newBrands={data.homepageNewBrands}
          topOffers={data.homepageTopOffers}
          hideViewAll
          compactSpacing
        />
        <HomeVaultDropSection drops={data.vaultDrops} />
      </>
    );
  }

  if (audience === "active-member") {
    return (
      <>
        <HomeHero variant="active-member" collageImages={data.heroBrandGalleryImages} />
        <HomeTrendingDepartmentCardsSection />
        <HomeVaultDropSection drops={data.vaultDrops} />
        <HomeMeatPoultryBanner compactSpacing />
        <HomeCategories onHomepage compactSpacing />
        <HomeGiftsHampersBanner compactSpacing />
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
        <HomeHero variant="free-trial" />
        <HomeTrendingDepartmentCardsSection />
        <HomeVaultDropSection drops={data.vaultDrops} />
        <HomeMeatPoultryBanner />
        <HomeWhyJoinFeatures compactSpacing mobileTwoColumn />
        <HomeGiftsHampersBanner compactSpacing />
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
