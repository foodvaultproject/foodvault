import type { Metadata } from "next";
import {
  AboutBrandsSection,
  AboutHero,
  AboutMembersSection,
  AboutMissionSection,
  AboutValuesSection,
  AboutWhatIsSection,
} from "@/components/about/AboutSections";

export const metadata: Metadata = {
  title: "About FoodVault",
  description:
    "FoodVault is a membership platform connecting consumers with New Zealand brands. Members pay a monthly subscription for exclusive discounts and purchase directly from partner businesses.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutWhatIsSection />
      <AboutMissionSection />
      <AboutMembersSection />
      <AboutBrandsSection />
      <AboutValuesSection />
    </>
  );
}
