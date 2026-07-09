import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartnerProfileView } from "@/components/brands/PartnerProfileView";
import {
  getPartnerDiscountCode,
  getPartnerProfile,
  getProfileViewerContext,
  getRecommendedBrands,
  isPartnerAffiliateProgramPublic,
} from "@/lib/member/partner-profile";
import { getBrandAffiliateViewerContext } from "@/lib/affiliate/server";
import { getViewerFavoriteContext } from "@/lib/member/viewer-favorites";

type PartnerProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PartnerProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPartnerProfile(slug);

  if (!profile) {
    return { title: "Brand Not Found | FoodVault" };
  }

  return {
    title: `${profile.businessName} | FoodVault`,
    description:
      profile.shortDescription ??
      "View this participating FoodVault partner brand and member offer details.",
  };
}

export default async function PartnerProfilePage({
  params,
}: PartnerProfilePageProps) {
  const { slug } = await params;
  const profile = await getPartnerProfile(slug);

  if (!profile) {
    notFound();
  }

  const [codeAccess, viewer, recommended, favoriteContext, affiliateContext, affiliatePubliclyVisible] =
    await Promise.all([
    getPartnerDiscountCode(profile.id),
    getProfileViewerContext(profile.id),
    getRecommendedBrands(profile.id, profile, 4),
    getViewerFavoriteContext(),
    getBrandAffiliateViewerContext(profile.id),
    isPartnerAffiliateProgramPublic(profile.id),
  ]);

  return (
    <PartnerProfileView
      profile={profile}
      code={codeAccess.code}
      codeState={codeAccess.state}
      viewer={viewer}
      recommended={recommended}
      favoritedPartnerIds={favoriteContext.favoritedPartnerIds}
      affiliateContext={affiliateContext}
      affiliatePubliclyVisible={affiliatePubliclyVisible}
    />
  );
}
