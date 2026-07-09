import type { Metadata } from "next";
import { AffiliateLoginPage } from "@/components/affiliate/AffiliateLoginPage";

export const metadata: Metadata = {
  title: "Affiliate Login | FoodVault",
};

export default function AffiliateLoginRoute() {
  return <AffiliateLoginPage />;
}
