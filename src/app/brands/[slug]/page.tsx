import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartnerProfileClientHydrator } from "@/components/brands/PartnerProfileClientHydrator";
import {
  getCachedPartnerProfile,
  getCachedPublicBrandSlugs,
  getCachedRecommendedBrands,
} from "@/lib/cache/public-directory";
import {
  hospitalityVenueToBrandCard,
  listHospitalityDemoVenues,
} from "@/lib/hospitality/demo-venues";
import { isHospitalityListing } from "@/lib/hospitality/types";
import { isPartnerAffiliateProgramPublic } from "@/lib/member/partner-profile";

type PartnerProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getCachedPublicBrandSlugs();
  const hospitalitySlugs = listHospitalityDemoVenues().map((venue) => venue.slug);
  return [...new Set([...slugs, ...hospitalitySlugs])].map((slug) => ({ slug }));
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
    isHospitalityListing(profile.listingModel)
      ? Promise.resolve(
          listHospitalityDemoVenues()
            .filter((venue) => venue.id !== profile.id)
            .slice(0, 4)
            .map(hospitalityVenueToBrandCard)
        )
      : getCachedRecommendedBrands(profile.id, slug, 4),
    isHospitalityListing(profile.listingModel)
      ? Promise.resolve(false)
      : isPartnerAffiliateProgramPublic(profile.id),
  ]);

  return (
    <PartnerProfileClientHydrator
      profile={profile}
      recommended={recommended}
      affiliatePubliclyVisible={affiliatePubliclyVisible}
    />
  );
}
