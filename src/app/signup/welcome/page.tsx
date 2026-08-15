import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { WelcomeScreen } from "@/components/signup/WelcomeScreen";
import { requireMemberSession } from "@/lib/member/signup-actions";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { activateMemberAfterCheckout } from "@/lib/payment-service/providers/stripe-member";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Your FoodVault membership is now active.",
};

type SignupWelcomePageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function SignupWelcomePage({
  searchParams,
}: SignupWelcomePageProps) {
  const member = await requireMemberSession();
  const { session_id: sessionId } = await searchParams;

  if (sessionId && getPaymentServiceConfig().isConfigured) {
    const activated = await activateMemberAfterCheckout(
      member.id,
      member.email,
      sessionId
    );

    if (activated) {
      after(() => {
        revalidatePath("/dashboard");
        revalidatePath("/membership");
        revalidatePath("/");
      });
    } else {
      console.warn("[signup/welcome] Membership activation pending after checkout", {
        sessionId,
        authUserId: member.id,
      });
    }
  }

  return <WelcomeScreen />;
}
