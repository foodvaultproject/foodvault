"use client";

import { useEffect, useState } from "react";
import { PartnerProfileView } from "@/components/brands/PartnerProfileView";
import type { BrandAffiliateViewerContext } from "@/lib/affiliate/server";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import { loadPartnerProfileViewerData } from "@/lib/member/partner-profile-viewer-actions";
import type {
  CodeAccessState,
  PartnerProfile,
  ProfileViewerContext,
} from "@/lib/member/partner-profile";

type PartnerProfileClientHydratorProps = {
  profile: PartnerProfile;
  recommended: BrandCard[];
  affiliatePubliclyVisible: boolean;
};

const ANON_VIEWER: ProfileViewerContext = {
  isLoggedIn: false,
  isPartner: false,
  isActiveMember: false,
  isFreeTrialMember: false,
  isAdmin: false,
  canFavorite: false,
  isFavorited: false,
  isOwnProfile: false,
  ownOnboardingState: null,
};

export function PartnerProfileClientHydrator({
  profile,
  recommended,
  affiliatePubliclyVisible,
}: PartnerProfileClientHydratorProps) {
  const [code, setCode] = useState<string | null>(null);
  const [codeState, setCodeState] = useState<CodeAccessState>("anon");
  const [flashSaleCode, setFlashSaleCode] = useState<string | null>(null);
  const [flashSaleCodeState, setFlashSaleCodeState] =
    useState<CodeAccessState>("anon");
  const [viewer, setViewer] = useState<ProfileViewerContext>(ANON_VIEWER);
  const [favoritedPartnerIds, setFavoritedPartnerIds] = useState<string[]>([]);
  const [affiliateContext, setAffiliateContext] =
    useState<BrandAffiliateViewerContext | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function hydrateViewerData() {
      const data = await loadPartnerProfileViewerData(
        profile.id,
        Boolean(profile.vaultDrop?.products.length)
      );

      if (cancelled) return;

      setCode(data.code);
      setCodeState(data.codeState);
      setFlashSaleCode(data.flashSaleCode);
      setFlashSaleCodeState(data.flashSaleCodeState);
      setViewer(data.viewer);
      setFavoritedPartnerIds(data.favoritedPartnerIds);
      setAffiliateContext(data.affiliateContext);
    }

    void hydrateViewerData();

    return () => {
      cancelled = true;
    };
  }, [profile.id, profile.vaultDrop?.products.length]);

  return (
    <PartnerProfileView
      profile={profile}
      code={code}
      codeState={codeState}
      flashSaleCode={flashSaleCode}
      flashSaleCodeState={flashSaleCodeState}
      viewer={viewer}
      recommended={recommended}
      favoritedPartnerIds={favoritedPartnerIds}
      affiliateContext={affiliateContext}
      affiliatePubliclyVisible={affiliatePubliclyVisible}
    />
  );
}
