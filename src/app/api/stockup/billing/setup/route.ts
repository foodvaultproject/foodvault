import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAppMode } from "@/lib/app-mode";
import { createStockupSetupIntent } from "@/lib/commerce/stockup-billing";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const headerStore = await headers();
  if (getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) !== "stockup") {
    return NextResponse.json({ error: "Auto-Restock is only available on StockUp" }, { status: 404 });
  }

  const { isConfigured, publishableKey } = getPaymentServiceConfig();
  if (!isConfigured || !publishableKey) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Sign in to save a card" }, { status: 401 });
  }

  const name =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;

  try {
    const setup = await createStockupSetupIntent({
      userId: user.id,
      email: user.email,
      name,
    });
    return NextResponse.json({ clientSecret: setup.clientSecret, publishableKey });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start card setup";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
