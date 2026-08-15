"use client";

import { useEffect, useState } from "react";
import { HomeFeaturedBrands } from "@/components/home/HomeFeaturedBrands";
import { HomeHero } from "@/components/home/HomeHero";
import { HomePageSkeleton } from "@/components/home/HomePageSkeleton";
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
import { getAuthSession, syncAuthSessionHints } from "@/lib/auth";
import { resolveInitialHomeAudience } from "@/lib/auth/session-hint";
import { resolveClientMembershipView } from "@/lib/member/client-membership";
import { getPartnerListing } from "@/lib/partner-data";
import type { StaticHomepageData } from "@/lib/homepage/static-data";

type HomeAudience = "guest" | "partner" | "active-member" | "free-trial";

function HomeAudienceContent({
  audience,
  data,
  partnerGalleryImages,
  isSettling,
}: {
  audience: HomeAudience;
  data: StaticHomepageData;
  partnerGalleryImages: string[];
  isSettling: boolean;
}) {
  const settleClass = isSettling
    ? "opacity-100 transition-opacity duration-200 ease-out"
    : "opacity-100";

  if (audience === "partner") {
    return (
      <div className={settleClass}>
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
      </div>
    );
  }

  if (audience === "active-member") {
    return (
      <div className={settleClass}>
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
      </div>
    );
  }

  if (audience === "free-trial") {
    return (
      <div className={settleClass}>
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
      </div>
    );
  }

  return (
    <div className={settleClass}>
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
    </div>
  );
}

export function HomePageClientRouter({ data }: { data: StaticHomepageData }) {
  const initialHint = resolveInitialHomeAudience();
  const [audience, setAudience] = useState<HomeAudience | "unknown">(initialHint);
  const [resolved, setResolved] = useState(initialHint !== "unknown");
  const [partnerGalleryImages, setPartnerGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function resolveAudience() {
      const [admin, session] = await Promise.all([
        isCurrentUserAdminAction(),
        getAuthSession(),
      ]);

      if (cancelled) return;

      if (admin || !session) {
        syncAuthSessionHints(null);
        setAudience("guest");
        setResolved(true);
        return;
      }

      if (session.accountType === "partner") {
        const listing = await getPartnerListing(session.id);
        if (cancelled) return;

        syncAuthSessionHints(session);
        setPartnerGalleryImages((listing?.galleryImageUrls ?? []).filter(Boolean).slice(0, 3));
        setAudience("partner");
        setResolved(true);
        return;
      }

      if (session.accountType !== "member") {
        syncAuthSessionHints(session);
        setAudience("guest");
        setResolved(true);
        return;
      }

      const membership = await resolveClientMembershipView();
      if (cancelled) return;

      syncAuthSessionHints(session, membership);

      if (membership.isActiveMember) {
        setAudience("active-member");
        setResolved(true);
        return;
      }

      if (membership.isFreeTrial) {
        setAudience("free-trial");
        setResolved(true);
        return;
      }

      setAudience("guest");
      setResolved(true);
    }

    void resolveAudience();

    return () => {
      cancelled = true;
    };
  }, []);

  if (audience === "unknown") {
    return <HomePageSkeleton />;
  }

  return (
    <div className={resolved ? "opacity-100 transition-opacity duration-200" : "opacity-0"}>
      <HomeAudienceContent
        audience={audience}
        data={data}
        partnerGalleryImages={partnerGalleryImages}
        isSettling={resolved}
      />
    </div>
  );
}
