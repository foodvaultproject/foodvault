import type { Metadata } from "next";
import { TermsContent } from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read FoodVault Terms & Conditions for New Zealand members, partner businesses, and affiliates. Membership, billing, refunds, and platform use.",
};

export default function TermsPage() {
  return <TermsContent />;
}
