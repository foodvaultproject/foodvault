import { NextResponse } from "next/server";
import { fulfillPantryOrderFromCheckoutSession } from "@/lib/commerce/fulfill-pantry-order";
import { getPantryOrderByStripeSessionId } from "@/lib/commerce/orders";
import { sendSupermarketOrderConfirmationEmail } from "@/lib/commerce/send-supermarket-order-email";
import { sendAdminNewOrderAlertEmail } from "@/lib/email-templates/templates/supermarket/admin-new-order-alert";
import { getStripeClient } from "@/lib/payment-service/providers/stripe-client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FoodVaultOrder } from "@/types/commerce";

async function sendSavedOrderEmails(order: FoodVaultOrder) {
  if (!order.items?.length) return;
  const admin = createAdminClient();
  if (!admin) return;

  const claim = await admin
    .from("foodvault_orders")
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq("id", order.id)
    .is("confirmation_sent_at", null)
    .select("id")
    .maybeSingle();

  if (claim.error || !claim.data) return;

  await sendSupermarketOrderConfirmationEmail(order);
  await sendAdminNewOrderAlertEmail({ order });
}

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  let order = await getPantryOrderByStripeSessionId(sessionId);
  let failure: string | null = null;
  if (!order) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"],
      });
      order = await fulfillPantryOrderFromCheckoutSession(session);
      if (!order) {
        const intent = session.payment_intent;
        const intentStatus =
          intent && typeof intent === "object" ? intent.status : null;
        failure = `Payment is ${session.payment_status ?? "unknown"}${intentStatus ? ` (${intentStatus})` : ""} and the order was not saved.`;
      }
    } catch (error) {
      failure = error instanceof Error ? error.message : "Unable to confirm checkout";
      console.error("[vault-market] Unable to confirm paid checkout session", {
        sessionId,
        error: failure,
      });
    }
  }

  if (!order) {
    return NextResponse.json({ order: null, error: failure }, { status: 202 });
  }

  try {
    await sendSavedOrderEmails(order);
  } catch (error) {
    console.error("[vault-market] Order notification failed", {
      orderId: order.id,
      error: error instanceof Error ? error.message : error,
    });
  }

  return NextResponse.json({ order });
}
