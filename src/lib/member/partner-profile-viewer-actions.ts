"use server";

import { getBrandAffiliateViewerContext } from "@/lib/affiliate/server";
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
