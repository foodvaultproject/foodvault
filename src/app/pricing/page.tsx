import type { Metadata } from "next";
import { HomeWhyJoinFeatures } from "@/components/home/HomeSections";
import { PricingFAQSection } from "@/components/pricing/PricingFAQSection";
import {
  PricingDualCTASection,
  PricingHero,
} from "@/components/pricing/PricingSections";
import { getCachedMembershipSettings } from "@/lib/cache/public-directory";
import { formatMembershipPriceMonthly } from "@/lib/member/pricing";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedMembershipSettings();
  const priceLabel = formatMembershipPriceMonthly(settings.membershipPriceMonthly);

  return {
    title: "Pricing",
    description: `FoodVault membership is ${priceLabel}. Browse brand discounts for free, then unlock promo codes with a paid membership from 900+ independent food and beverage brands across New Zealand.`,
  };
}

export default async function PricingPage() {
  const settings = await getCachedMembershipSettings();

  return (
    <>
      <PricingHero settings={settings} />
      <HomeWhyJoinFeatures mobileTwoColumn />
      <PricingFAQSection />
      <PricingDualCTASection />
    </>
  );
}
