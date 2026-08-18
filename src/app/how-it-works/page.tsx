import type { Metadata } from "next";
import { HowItWorksPageContent } from "@/components/how-it-works/HowItWorksSections";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "FoodVault helps Kiwis save money online and in-store with exclusive member perks from Kiwi brands and local hospitality venues.",
};

export const revalidate = 86400;

export default function HowItWorksPage() {
  return <HowItWorksPageContent />;
}
