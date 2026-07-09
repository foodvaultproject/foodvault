import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to your FoodVault member or partner account to browse brands, manage your membership, or access your partner dashboard.",
};

export default function LoginRoute() {
  return <LoginPage />;
}
