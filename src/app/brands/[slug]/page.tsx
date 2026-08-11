import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartnerProfileClientHydrator } from "@/components/brands/PartnerProfileClientHydrator";
import {
  getCachedPartnerProfile,
  getCachedPublicBrandSlugs,
  getCachedRecommendedBrands,
} from "@/lib/cache/public-directory";
import { isPartnerAffiliateProgramPublic } from "@/lib/member/partner-profile";

type PartnerProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getCachedPublicBrandSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PartnerProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getCachedPartnerProfile(slug);

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
  const profile = await getCachedPartnerProfile(slug);

  if (!profile) {
    notFound();
  }

  const [recommended, affiliatePubliclyVisible] = await Promise.all([
    getCachedRecommendedBrands(profile.id, slug, 4),
    isPartnerAffiliateProgramPublic(profile.id),
  ]);

  return (
    <PartnerProfileClientHydrator
      profile={profile}
      recommended={recommended}
      affiliatePubliclyVisible={affiliatePubliclyVisible}
    />
  );
}
