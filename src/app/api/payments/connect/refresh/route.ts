import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshAffiliatePayoutAccount } from "@/lib/payment-service/engine";
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
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!affiliate) {
    return NextResponse.json({ error: "Affiliate account required" }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client unavailable" }, { status: 503 });
  }

  const { data: account } = await admin
    .from("payout_accounts")
    .select("external_account_id")
    .eq("affiliate_id", affiliate.id)
    .maybeSingle();

  if (!account?.external_account_id) {
    return NextResponse.json({ error: "No payout account found" }, { status: 404 });
  }

  try {
    const status = await refreshAffiliatePayoutAccount(
      String(affiliate.id),
      String(account.external_account_id)
    );
    return NextResponse.json({ status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to refresh payout account" },
      { status: 500 }
    );
  }
}
