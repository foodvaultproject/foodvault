import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";
import { getAppMode } from "@/lib/app-mode";

export async function generateMetadata(): Promise<Metadata> {
  if (getAppMode() === "stockup") {
    return {
      title: "Log in",
      description: "Log in to StockUp to open your saved grocery list and view your orders.",
    };
  }

  return {
    title: "Log In",
    description:
      "Log in to your FoodVault member or partner account to browse brands and local venues, manage your membership, or access your partner dashboard.",
  };
}

export default function LoginRoute() {
  return <LoginPage stockup={getAppMode() === "stockup"} />;
}
