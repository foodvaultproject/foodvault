import type { Metadata } from "next";
import {
  AboutFounderSection,
  AboutHero,
  AboutValueSplitSection,
} from "@/components/about/AboutSections";

export const metadata: Metadata = {
  title: "About FoodVault",
  description:
    "FoodVault helps Kiwis discover great local brands, unlock exclusive member savings, and shop directly from the businesses behind the products they love.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutValueSplitSection />
      <AboutFounderSection />
    </>
  );
}
