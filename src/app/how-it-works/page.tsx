import type { Metadata } from "next";
import { HowItWorksPageContent } from "@/components/how-it-works/HowItWorksSections";
import { getActiveMemberView } from "@/lib/member/active-member";
import { getHomepageFeaturedBrands } from "@/lib/member/browse-brands";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "FoodVault helps Kiwis save money on everyday food, beverage, household and health products through exclusive member pricing.",
};

export const dynamic = "force-dynamic";

export default async function HowItWorksPage() {
  const [{ isActiveMember }, featuredBrands] = await Promise.all([
    getActiveMemberView(),
    getHomepageFeaturedBrands(6),
  ]);

  return (
    <HowItWorksPageContent featuredBrands={featuredBrands} isActiveMember={isActiveMember} />
  );
}
