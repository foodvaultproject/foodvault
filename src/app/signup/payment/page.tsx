import type { Metadata } from "next";
import { SignupPaymentCheckout } from "@/components/signup/SignupPaymentCheckout";
import { getMembershipSettings } from "@/lib/member/settings";
import { requireMemberSession } from "@/lib/member/signup-actions";

export const metadata: Metadata = {
  title: "Secure Payment",
  description: "Complete your FoodVault membership payment.",
};

type SignupPaymentPageProps = {
  searchParams: Promise<{ cancelled?: string }>;
};

export default async function SignupPaymentPage({ searchParams }: SignupPaymentPageProps) {
  await requireMemberSession();
  const settings = await getMembershipSettings();
  const { cancelled } = await searchParams;

  return (
    <SignupPaymentCheckout
      settings={settings}
      cancelled={cancelled === "1"}
    />
  );
}
