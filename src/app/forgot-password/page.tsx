import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";

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

  return (
    <ForgotPasswordPage
      initialEmail={params.email?.trim() ?? ""}
      isPartner={params.account === "partner"}
      initialError={params.error ?? null}
    />
  );
}
