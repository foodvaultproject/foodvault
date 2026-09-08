import { NextResponse } from "next/server";
import { getPantryOrderByStripeSessionId } from "@/lib/commerce/orders";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  const order = await getPantryOrderByStripeSessionId(sessionId);
  if (!order) {
    return NextResponse.json({ order: null }, { status: 202 });
  }

  return NextResponse.json({ order });
}
