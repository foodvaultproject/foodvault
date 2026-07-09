import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureAffiliatePayoutAccount } from "@/lib/payment-service/engine";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";

export async function POST() {
  const { isConfigured } = getPaymentServiceConfig();
  if (!isConfigured) {
    return NextResponse.json({ error: "Payment service is not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, first_name, last_name, email, country")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!affiliate) {
    return NextResponse.json({ error: "Affiliate account required" }, { status: 403 });
  }

  try {
    const result = await ensureAffiliatePayoutAccount({
      affiliateId: String(affiliate.id),
      email: String(affiliate.email),
      country: String(affiliate.country ?? "New Zealand"),
      firstName: String(affiliate.first_name ?? ""),
      lastName: String(affiliate.last_name ?? ""),
    });

    return NextResponse.json({ url: result.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start onboarding" },
      { status: 500 }
    );
  }
}
