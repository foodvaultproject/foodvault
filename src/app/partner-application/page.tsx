import type { Metadata } from "next";
import { PartnerApplicationPage } from "@/components/partner-application/PartnerApplicationPage";

export const metadata: Metadata = {
  title: "Business Application",
  description:
    "Complete your FoodVault Partner business application. Connect with New Zealand members, drive direct sales, and grow your independent food brand.",
};

export default function PartnerApplicationRoute() {
  return <PartnerApplicationPage />;
}
