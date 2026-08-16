"use server";

import { getBrandAffiliateViewerContext } from "@/lib/affiliate/server";
import { isHospitalityPreviewId } from "@/lib/hospitality/types";
import {
  getPartnerDiscountCode,
  getPartnerVaultDropCode,
  getProfileViewerContext,
} from "@/lib/member/partner-profile";
import { getViewerFavoriteContext } from "@/lib/member/viewer-favorites";

export async function loadPartnerProfileViewerData(
  partnerId: string,
  hasVaultDropProducts: boolean
) {
  if (isHospitalityPreviewId(partnerId)) {
    const [viewer, favoriteContext] = await Promise.all([
      getProfileViewerContext(partnerId),
      getViewerFavoriteContext(),
    ]);

    return {
      code: null,
      codeState: "anon" as const,
      flashSaleCode: null,
      flashSaleCodeState: "anon" as const,
      viewer,
      favoritedPartnerIds: favoriteContext.favoritedPartnerIds,
      affiliateContext: { isAffiliate: false, referralUrl: null },
    };
  }

  const [
    codeAccess,
    flashSaleCodeAccess,
    viewer,
    favoriteContext,
    affiliateContext,
  ] = await Promise.all([
    getPartnerDiscountCode(partnerId),
    hasVaultDropProducts
      ? getPartnerVaultDropCode(partnerId)
      : Promise.resolve({ code: null, state: "anon" as const }),
    getProfileViewerContext(partnerId),
    getViewerFavoriteContext(),
    getBrandAffiliateViewerContext(partnerId),
  ]);

  return {
    code: codeAccess.code,
    codeState: codeAccess.state,
    flashSaleCode: flashSaleCodeAccess.code,
    flashSaleCodeState: flashSaleCodeAccess.state,
    viewer,
    favoritedPartnerIds: favoriteContext.favoritedPartnerIds,
    affiliateContext,
  };
}
