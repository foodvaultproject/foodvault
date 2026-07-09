import type { Metadata } from "next";
import { SignupPartnerSection } from "@/components/signup/SignupPartnerSection";
import { SignupStep1Form } from "@/components/signup/SignupStep1Form";
import { getMembershipSettings } from "@/lib/member/settings";

export const metadata: Metadata = {
  title: "Create Your Account",
  description:
    "Join FoodVault and unlock exclusive member pricing from independent food and beverage brands across New Zealand.",
};

export default async function SignupPage() {
  const settings = await getMembershipSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <SignupStep1Form settings={settings} />
      <SignupPartnerSection />
    </div>
  );
}
