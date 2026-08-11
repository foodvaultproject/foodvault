import type { Metadata } from "next";
import { HowItWorksPageContent } from "@/components/how-it-works/HowItWorksSections";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "FoodVault helps Kiwis save money on everyday food, beverage, household and health products through exclusive member pricing.",
};

export const revalidate = 86400;

export default function HowItWorksPage() {
  return <HowItWorksPageContent />;
}
