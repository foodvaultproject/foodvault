import type { Metadata } from "next";
import { ForBrandsFAQSection } from "@/components/for-brands/ForBrandsFAQSection";
import { ForBrandsPartnerLogosSection } from "@/components/for-brands/ForBrandsPartnerLogosSection";
import {
  AffiliateProgrammeSection,
  ForBrandsFinalCTA,
  ForBrandsHero,
  HowItWorksSection,
  PartnerBenefitsSection,
  WhyFoodVaultSection,
} from "@/components/for-brands/ForBrandsSections";
import { getPartnerLogos } from "@/lib/member/browse-brands";

export const metadata: Metadata = {
  title: "For Brands",
  description:
    "Grow your New Zealand brand with FoodVault. Showcase your brand, promote exclusive member offers, and drive customers to your own website—while keeping complete control.",
};

export default async function ForBrandsPage() {
  const logos = await getPartnerLogos(40);

  return (
    <>
      <ForBrandsHero />
      <ForBrandsPartnerLogosSection logos={logos} />
      <WhyFoodVaultSection />
      <PartnerBenefitsSection />
      <HowItWorksSection />
      <AffiliateProgrammeSection />
      <ForBrandsFAQSection />
      <ForBrandsFinalCTA />
    </>
  );
}
