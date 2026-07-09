import type { Metadata } from "next";
import { PrivacyContent } from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "FoodVault Privacy Policy for New Zealand members. Learn how we collect, use, and protect your data under the Privacy Act 2020.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
