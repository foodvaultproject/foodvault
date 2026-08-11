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
  title: "For Brands",
  description:
    "Grow your New Zealand brand with FoodVault. Showcase your brand, promote exclusive member offers, and drive customers to your own website—while keeping complete control.",
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
