import { NextResponse } from "next/server";
import { memberUserFilter } from "@/lib/member/auth";
import {
  createMemberCheckoutSession,
  getMemberPriceId,
} from "@/lib/payment-service/providers/stripe-member";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const { isConfigured } = getPaymentServiceConfig();
  if (!isConfigured) {
    return NextResponse.json({ error: "Payment service is not configured" }, { status: 503 });
  }

  if (!getMemberPriceId()) {
    return NextResponse.json(
      { error: "Member subscription price is not configured" },
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

  const { data: member } = await memberUserFilter(
    supabase
      .from("members")
      .select("deleted_at, stripe_customer_id, email"),
    user.id
  ).maybeSingle();

  if (member?.deleted_at) {
    return NextResponse.json({ error: "Member account required" }, { status: 403 });
  }

  try {
    const session = await createMemberCheckoutSession({
      authUserId: user.id,
      email: member?.email ?? user.email,
      stripeCustomerId: member?.stripe_customer_id,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start checkout" },
      { status: 500 }
    );
  }
}
