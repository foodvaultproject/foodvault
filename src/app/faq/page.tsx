import type { Metadata } from "next";
import { FAQMainContent } from "@/components/faq/FAQContent";
import { FAQContactCTA, FAQHero } from "@/components/faq/FAQPageSections";
import { getMemberFaqs } from "@/data/faq";
import { formatMembershipPriceMonthly } from "@/lib/member/pricing";
import { getMembershipSettings } from "@/lib/member/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getMembershipSettings();
  const priceLabel = formatMembershipPriceMonthly(settings.membershipPriceMonthly);

  return {
    title: "Help Centre",
    description: `Find answers about FOODVAULT memberships in New Zealand (${priceLabel}, ${settings.trialLengthDays}-day free trial), partner listings, the Affiliate Program, billing, and how the platform works.`,
  };
}

export default async function FAQPage() {
  const settings = await getMembershipSettings();
  const memberFaqs = getMemberFaqs(settings);

  return (
    <>
      <FAQHero />
      <FAQMainContent memberFaqs={memberFaqs} />
      <FAQContactCTA />
    </>
  );
}
