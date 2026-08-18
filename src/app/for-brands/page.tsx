import type { Metadata } from "next";
import { ForBrandsFAQSection } from "@/components/for-brands/ForBrandsFAQSection";
import { ForBrandsPartnerLogosSection } from "@/components/for-brands/ForBrandsPartnerLogosSection";
import {
  ForBrandsHero,
  HowItWorksSection,
  PartnerBenefitsSection,
} from "@/components/for-brands/ForBrandsSections";
import { getCachedPartnerLogos } from "@/lib/cache/public-directory";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "For Businesses",
  description:
    "Grow your New Zealand business with FoodVault. Showcase your brand or venue, promote exclusive member offers, and drive web traffic or local foot traffic—while keeping complete control.",
};

export default async function ForBrandsPage() {
  const logos = await getCachedPartnerLogos(40);

  return (
    <>
      <ForBrandsHero />
      <ForBrandsPartnerLogosSection logos={logos} />
      <PartnerBenefitsSection />
      <HowItWorksSection />
      <ForBrandsFAQSection />
    </>
  );
}
