import type { Metadata } from "next";
import { PartnerApplicationSuccess } from "@/components/partner-application/PartnerApplicationSuccess";

export const metadata: Metadata = {
  title: "Application Submitted",
  description:
    "Your FoodVault partner application has been submitted successfully. We will review your details and respond within 24 hours.",
};

export default function PartnerApplicationSubmittedPage() {
  return <PartnerApplicationSuccess />;
}
