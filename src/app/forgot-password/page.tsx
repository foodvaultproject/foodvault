import type { Metadata } from "next";
import { headers } from "next/headers";
import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";
import { getAppMode } from "@/lib/app-mode";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your FoodVault member or partner account password.",
};

type ForgotPasswordRouteProps = {
  searchParams: Promise<{ email?: string; account?: string; error?: string }>;
};

export default async function ForgotPasswordRoute({
  searchParams,
}: ForgotPasswordRouteProps) {
  const params = await searchParams;
  const headerStore = await headers();
  const stockup =
    getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) ===
    "stockup";

  return (
    <ForgotPasswordPage
      initialEmail={params.email?.trim() ?? ""}
      isPartner={params.account === "partner"}
      initialError={params.error ?? null}
      stockup={stockup}
    />
  );
}
