import type { Metadata } from "next";
import { PartnerCreateAccountPage } from "@/components/partner-application/PartnerCreateAccountPage";

export const metadata: Metadata = {
  title: "Create Partner Account",
  description:
    "Create your FoodVault Partner account to begin your business application.",
};

export default function PartnerCreateAccountRoute() {
  return <PartnerCreateAccountPage />;
}
