import type { Metadata } from "next";
import { HomeWhyJoinFeatures } from "@/components/home/HomeSections";
import { PricingFAQSection } from "@/components/pricing/PricingFAQSection";
import {
  PricingDualCTASection,
  PricingHero,
} from "@/components/pricing/PricingSections";
import { formatMembershipPriceMonthly } from "@/lib/member/pricing";
import { getMembershipSettings } from "@/lib/member/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getMembershipSettings();
  const priceLabel = formatMembershipPriceMonthly(settings.membershipPriceMonthly);

  return {
    title: "Pricing",
    description: `FoodVault membership is ${priceLabel} with a ${settings.trialLengthDays}-day free trial. Unlock exclusive member pricing from 900+ independent food and beverage brands across New Zealand.`,
  };
}

export default async function PricingPage() {
  const settings = await getMembershipSettings();

  return (
    <>
      <PricingHero settings={settings} />
      <HomeWhyJoinFeatures />
      <PricingFAQSection trialLengthDays={settings.trialLengthDays} />
      <PricingDualCTASection />
    </>
  );
}
