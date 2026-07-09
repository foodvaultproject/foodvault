import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensurePartnerBillingSetup } from "@/lib/payment-service/engine";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { formatBusinessName } from "@/lib/business-name";

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

  const { data: partner } = await supabase
    .from("partners")
    .select("id, business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!partner) {
    return NextResponse.json({ error: "Partner account required" }, { status: 403 });
  }

  try {
    const result = await ensurePartnerBillingSetup({
      partnerId: String(partner.id),
      email: String(user.email ?? ""),
      businessName: formatBusinessName(String(partner.business_name ?? "Partner")),
    });

    return NextResponse.json({ url: result.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start billing setup" },
      { status: 500 }
    );
  }
}
