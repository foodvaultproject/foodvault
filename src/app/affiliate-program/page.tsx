import type { Metadata } from "next";
import { AffiliateProgramLandingPage } from "@/components/affiliate/AffiliateProgramLandingPage";

export const metadata: Metadata = {
  title: "Affiliate Program | FoodVault",
  description:
    "Join the FoodVault Affiliate Program for free and earn commission promoting participating brands.",
  alternates: {
    canonical: "/affiliate-program",
  },
  openGraph: {
    title: "Affiliate Program | FoodVault",
    description:
      "Join the FoodVault Affiliate Program for free and earn commission promoting participating brands.",
    url: "/affiliate-program",
  },
};

export default function AffiliateProgramPage() {
  return <AffiliateProgramLandingPage />;
}
