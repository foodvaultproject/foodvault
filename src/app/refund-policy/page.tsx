import type { Metadata } from "next";
import { RefundContent } from "@/components/legal/RefundContent";
import { isStockUpRequest, StockUpRefundContent } from "@/components/legal/StockUpLegal";

export async function generateMetadata(): Promise<Metadata> {
  if (await isStockUpRequest()) {
    return {
      title: "Refund Policy",
      description: "How StockUp handles refunds and cancellations for grocery orders.",
    };
  }

  return {
    title: "Refund & Cancellation Policy",
    description:
      "FoodVault Refund & Cancellation Policy for New Zealand members. Learn how to cancel your membership, request refunds, and handle partner purchase enquiries.",
  };
}

export default async function RefundPolicyPage() {
  if (await isStockUpRequest()) return <StockUpRefundContent />;
  return <RefundContent />;
}
