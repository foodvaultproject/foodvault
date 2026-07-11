import type { Metadata } from "next";
import { HowItWorksPageContent } from "@/components/how-it-works/HowItWorksSections";
import { getActiveMemberView } from "@/lib/member/active-member";
import { getHomepageFeaturedBrands } from "@/lib/member/browse-brands";
import { getMembershipSettings } from "@/lib/member/settings";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how FoodVault works for members and brands. Unlock exclusive member pricing, shop direct with New Zealand partners, or grow your brand with free listing and 0% commission.",
};

export const dynamic = "force-dynamic";

export default async function HowItWorksPage() {
  const [featuredBrands, settings, { isActiveMember }] = await Promise.all([
    getHomepageFeaturedBrands(6),
    getMembershipSettings(),
    getActiveMemberView(),
  ]);

  return (
    <HowItWorksPageContent
      featuredBrands={featuredBrands}
      settings={settings}
      isActiveMember={isActiveMember}
    />
  );
}
