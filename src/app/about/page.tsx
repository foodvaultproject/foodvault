import type { Metadata } from "next";
import {
  AboutFounderSection,
  AboutHero,
  AboutValueSplitSection,
} from "@/components/about/AboutSections";

export const metadata: Metadata = {
  title: "About FoodVault",
  description:
    "Kiwi and Piggy crashed trolleys, became good mates, and FoodVault was born. Discover how we help Kiwi brands get discovered and Kiwis shop direct and save.",
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
