import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { WelcomeScreen } from "@/components/signup/WelcomeScreen";
import { isSupabaseConfigured } from "@/lib/auth";
import { requireMemberSession } from "@/lib/member/signup-actions";
import { isActiveMemberRow } from "@/lib/member/membership-status";
import { resolveMemberBillingRow } from "@/lib/member/member-record";
import { getMembershipSettings } from "@/lib/member/settings";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { activateMemberAfterCheckout } from "@/lib/payment-service/providers/stripe-member";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Your FoodVault membership is now active.",
};

type SignupWelcomePageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

/**
 * Resolve the member's real membership state from Supabase. The Stripe
 * `session_id` only triggers activation — the displayed experience is always
 * driven by the persisted membership status, never the URL.
 */
async function resolveMemberPlan(userId: string): Promise<"trial" | "paid"> {
  if (!isSupabaseConfigured()) {
    return "trial";
  }

  const supabase = await createClient();
  const member = await resolveMemberBillingRow(supabase, userId);
  return isActiveMemberRow(member) ? "paid" : "trial";
}

export default async function SignupWelcomePage({
  searchParams,
}: SignupWelcomePageProps) {
  const member = await requireMemberSession();
  const { session_id: sessionId } = await searchParams;

  if (sessionId && getPaymentServiceConfig().isConfigured) {
    // Activate during render so the persisted status reflects the paid
    // subscription before we read it below. Cache revalidation must run
    // outside render, so it is deferred to `after()`.
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

  const [plan, settings] = await Promise.all([
    resolveMemberPlan(member.id),
    getMembershipSettings(),
  ]);

  return <WelcomeScreen plan={plan} trialLengthDays={settings.trialLengthDays} />;
}
