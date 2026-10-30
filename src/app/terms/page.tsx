import type { Metadata } from "next";
import { TermsContent } from "@/components/legal/TermsContent";
import { isStockUpRequest, StockUpTermsContent } from "@/components/legal/StockUpLegal";

export async function generateMetadata(): Promise<Metadata> {
  if (await isStockUpRequest()) {
    return {
      title: "Terms of Use",
      description: "StockUp terms for grocery shopping, accounts, and orders in New Zealand.",
    };
  }

  return {
    title: "Terms & Conditions",
    description:
      "Read FoodVault Terms & Conditions for New Zealand members, partner businesses, and affiliates. Membership, billing, refunds, and platform use.",
  };
}

export default async function TermsPage() {
  if (await isStockUpRequest()) return <StockUpTermsContent />;
  return <TermsContent />;
}
