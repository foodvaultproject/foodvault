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
  HomePartnerBanner,
  HomePartnerQuickLinks,
  HomeQuickActions,
  HomeGiftsHampersBanner,
  HomeMeatPoultryBanner,
  HomeWhyJoinFeatures,
} from "@/components/home/HomeSections";
import { HomeDineLocalSection } from "@/components/hospitality/HomeDineLocalSection";
import { isCurrentUserAdminAction } from "@/lib/admin/auth";
import { getAuthSession, syncAuthSessionHints } from "@/lib/auth";
import { resolveInitialHomeAudience } from "@/lib/auth/session-hint";
import { resolveClientMembershipView } from "@/lib/member/client-membership";
import { getPartnerListing } from "@/lib/partner-data";
import type { StaticHomepageData } from "@/lib/homepage/static-data";

type HomeAudience = "guest" | "partner" | "active-member";

function HomeAudienceContent({
  audience,
  data,
  partnerGalleryImages,
  isSettling,
  hospitalityPartner = false,
}: {
  audience: HomeAudience;
  data: StaticHomepageData;
  partnerGalleryImages: string[];
  isSettling: boolean;
  hospitalityPartner?: boolean;
}) {
  const settleClass = isSettling
    ? "opacity-100 transition-opacity duration-200 ease-out"
    : "opacity-100";

  if (audience === "partner") {
    return (
      <div className={settleClass}>
        {hospitalityPartner ? null : <PartnerAffiliateSetupBanner variant="compact" />}
        <HomeHero
          variant="partner"
          collageImages={partnerGalleryImages}
          hospitality={hospitalityPartner}
        />
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
        <HomeDineLocalSection compactSpacing />
        <HomeVaultDropSection drops={data.vaultDrops} />
      </div>
    );
  }

  if (audience === "active-member") {
    return (
      <div className={settleClass}>
        <HomeHero variant="active-member" />
        <HomeTrendingDepartmentCardsSection />
        <HomeVaultDropSection drops={data.vaultDrops} />
        <HomeMeatPoultryBanner compactSpacing />
        <HomeQuickActions compactSpacing />
        <HomeGiftsHampersBanner compactSpacing />
        <HomeTrendingSection
          trending={data.homepageTrendingBrands}
          newBrands={data.homepageNewBrands}
          topOffers={data.homepageTopOffers}
          hideViewAll
          compactSpacing
        />
        <HomeDineLocalSection compactSpacing />
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
      <HomeDineLocalSection />
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
  const [hospitalityPartner, setHospitalityPartner] = useState(false);

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
        setHospitalityPartner(listing?.listingModel === "hospitality_venue");
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
        hospitalityPartner={hospitalityPartner}
        isSettling={resolved}
      />
    </div>
  );
}
