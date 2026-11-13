import { NextResponse } from "next/server";
import { fulfillPantryOrderFromCheckoutSession } from "@/lib/commerce/fulfill-pantry-order";
import { getPantryOrderByStripeSessionId } from "@/lib/commerce/orders";
import { sendSavedOrderEmails } from "@/lib/commerce/send-supermarket-order-email";
import { getStripeClient } from "@/lib/payment-service/providers/stripe-client";

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
