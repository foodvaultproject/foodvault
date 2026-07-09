import type { Metadata } from "next";
import { PartnerLoginPage } from "@/components/auth/PartnerLoginPage";

export const metadata: Metadata = {
  title: "Partner Log In",
  description:
    "Log in to your FoodVault Partner account to manage your business listing, member offer, and partner dashboard.",
};

export default function PartnerLoginRoute() {
  return <PartnerLoginPage />;
}
