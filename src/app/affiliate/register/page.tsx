import type { Metadata } from "next";
import { AffiliateRegisterPage } from "@/components/affiliate/AffiliateRegisterPage";

export const metadata: Metadata = {
  title: "Become an Affiliate | FoodVault",
};

export default function AffiliateRegisterRoute() {
  return <AffiliateRegisterPage />;
}
