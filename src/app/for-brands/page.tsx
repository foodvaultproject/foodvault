import type { Metadata } from "next";
import { ForBrandsFAQSection } from "@/components/for-brands/ForBrandsFAQSection";
import {
  DashboardPreviewSection,
  EverythingYouManageSection,
  ForBrandsFinalCTA,
  ForBrandsHero,
  FreeAffiliateProgramSection,
  PartnerJourneySection,
  WhyBrandsJoinSection,
  WhyFoodVaultIsDifferentSection,
  WhyItsFreeSection,
} from "@/components/for-brands/ForBrandsSections";

export const metadata: Metadata = {
  title: "For Brands",
  description:
    "Grow your New Zealand brand with FoodVault. Drive website traffic, own every customer, launch a free affiliate program and pay 0% commission on product sales.",
};

export default function ForBrandsPage() {
  return (
    <>
      <ForBrandsHero />
      <WhyBrandsJoinSection />
      <WhyFoodVaultIsDifferentSection />
      <EverythingYouManageSection />
      <FreeAffiliateProgramSection />
      <PartnerJourneySection />
      <DashboardPreviewSection />
      <WhyItsFreeSection />
      <ForBrandsFAQSection />
      <ForBrandsFinalCTA />
    </>
  );
}
