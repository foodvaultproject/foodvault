import type { Metadata } from "next";
import { RefundContent } from "@/components/legal/RefundContent";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "FoodVault Refund & Cancellation Policy for New Zealand members. Learn how to cancel your membership, request refunds, and handle partner purchase enquiries.",
};

export default function RefundPolicyPage() {
  return <RefundContent />;
}
