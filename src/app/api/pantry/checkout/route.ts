import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/auth";
import {
  createPantryCheckoutSession,
  getCheckoutOrigin,
  parsePantryCheckoutItems,
  parseVaultMarketDelivery,
  validatePantryCheckoutItems,
} from "@/lib/commerce/create-pantry-checkout";
import { resolveMemberBillingRow } from "@/lib/member/member-record";
import { isActiveMemberRow } from "@/lib/member/membership-status";
import { getMembershipRecord } from "@/lib/member/queries";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { createClient } from "@/lib/supabase/server";

const STRIPE_CONFIG_ERROR =
  "Stripe is not configured correctly. Set STRIPE_SECRET_KEY in .env.local to your real test or live key.";

export async function POST(request: Request) {
  const { isConfigured } = getPaymentServiceConfig();
  if (!isConfigured) {
    return NextResponse.json({ error: STRIPE_CONFIG_ERROR }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
  }

  const rawItems =
    body && typeof body === "object" && "items" in body ? body.items : body;
  const rawDelivery =
    body && typeof body === "object" && "delivery" in body ? body.delivery : null;

  try {
    const requested = parsePantryCheckoutItems(rawItems);
    const delivery = parseVaultMarketDelivery(rawDelivery);
    const items = await validatePantryCheckoutItems(requested);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let stripeCustomerId: string | null = null;
    let membershipId: string | null = null;
    if (isSupabaseConfigured()) {
      if (!user) {
        return NextResponse.json(
          { error: "Log in with an active membership to use member checkout." },
          { status: 401 }
        );
      }

      const [membership, billing] = await Promise.all([
        getMembershipRecord(user.id),
        resolveMemberBillingRow(supabase, user.id),
      ]);
      const active =
        isActiveMemberRow(billing) || membership?.status === "active";
      if (!active) {
        return NextResponse.json(
          { error: "An active FoodVault membership is required for Vault Market checkout." },
          { status: 403 }
        );
      }

      stripeCustomerId = membership?.stripeCustomerId?.trim() || billing?.stripe_customer_id?.trim() || null;
      membershipId = user.id;

      const { data: vaultMembership } = await supabase
        .from("foodvault_memberships")
        .select("status, stripe_customer_id")
        .or(`auth_user_id.eq.${user.id},member_id.eq.${user.id}`)
        .maybeSingle();
      const vaultRow = vaultMembership as { status?: string; stripe_customer_id?: string } | null;
      if (vaultRow?.stripe_customer_id?.trim()) {
        stripeCustomerId = vaultRow.stripe_customer_id.trim();
      }
    }

    const session = await createPantryCheckoutSession({
      items,
      delivery,
      userId: user?.id ?? null,
      membershipId,
      customerEmail: delivery.email || user?.email || null,
      stripeCustomerId,
      origin: getCheckoutOrigin(request),
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start checkout";
    const isAuthError = /invalid api key/i.test(message);
    const isClientError =
      /cart|product|quantity|stock|available|member price|required|email|phone|postcode|street|suburb|city|delivery/i.test(
        message
      );

    return NextResponse.json(
      { error: isAuthError ? STRIPE_CONFIG_ERROR : message },
      { status: isAuthError ? 500 : isClientError ? 400 : 500 }
    );
  }
}
