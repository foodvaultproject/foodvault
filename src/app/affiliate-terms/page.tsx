import type { Metadata } from "next";
import { AffiliateTermsContent } from "@/components/legal/AffiliateTermsContent";

export const metadata: Metadata = {
  title: "Affiliate Programme Terms & Conditions",
  description:
    "Read FoodVault Affiliate Programme Terms & Conditions. Learn about eligibility, referral links, commissions, responsibilities, and prohibited activities for affiliates.",
};

export default function AffiliateTermsPage() {
  return <AffiliateTermsContent />;
}
