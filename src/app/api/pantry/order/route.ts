import { NextResponse } from "next/server";
import { fulfillPantryOrderFromCheckoutSession } from "@/lib/commerce/fulfill-pantry-order";
import { getPantryOrderByStripeSessionId } from "@/lib/commerce/orders";
import { getStripeClient } from "@/lib/payment-service/providers/stripe-client";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  let order = await getPantryOrderByStripeSessionId(sessionId);
  if (!order) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
      order = await fulfillPantryOrderFromCheckoutSession(session);
    } catch (error) {
      console.error("[vault-market] Unable to confirm paid checkout session", {
        sessionId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  if (!order) {
    return NextResponse.json({ order: null }, { status: 202 });
  }

  return NextResponse.json({ order });
}
