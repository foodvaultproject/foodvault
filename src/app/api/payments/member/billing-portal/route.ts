import { NextResponse } from "next/server";
import { resolveMemberBillingRow } from "@/lib/member/member-record";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { createMemberBillingPortalSession } from "@/lib/payment-service/providers/stripe-member";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const { isConfigured } = getPaymentServiceConfig();
  if (!isConfigured) {
    return NextResponse.json(
      { error: "Payment service is not configured" },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.user_metadata?.account_type === "partner") {
    return NextResponse.json({ error: "Member account required" }, { status: 403 });
  }

  const member = await resolveMemberBillingRow(supabase, user.id);
  const stripeCustomerId = member?.stripe_customer_id?.trim();

  if (!stripeCustomerId) {
    return NextResponse.json(
      {
        error:
          "We couldn't find a billing account for you. Billing management is only available once your paid membership is active.",
      },
      { status: 409 }
    );
  }

  try {
    const session = await createMemberBillingPortalSession(stripeCustomerId);

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to open the billing portal. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[billing-portal] Failed to create billing portal session", {
      authUserId: user.id,
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      { error: "Unable to open the billing portal. Please try again." },
      { status: 500 }
    );
  }
}
