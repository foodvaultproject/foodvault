import type { Metadata } from "next";
import { PrivacyContent } from "@/components/legal/PrivacyContent";
import { isStockUpRequest, StockUpPrivacyContent } from "@/components/legal/StockUpLegal";

export async function generateMetadata(): Promise<Metadata> {
  if (await isStockUpRequest()) {
    return {
      title: "Privacy Policy",
      description:
        "How StockUp collects and uses personal information for grocery accounts and orders in New Zealand.",
    };
  }

  return {
    title: "Privacy Policy",
    description:
      "FoodVault Privacy Policy for New Zealand members. Learn how we collect, use, and protect your data under the Privacy Act 2020.",
  };
}

export default async function PrivacyPage() {
  if (await isStockUpRequest()) return <StockUpPrivacyContent />;
  return <PrivacyContent />;
}
