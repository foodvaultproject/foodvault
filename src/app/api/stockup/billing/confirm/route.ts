import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAppMode } from "@/lib/app-mode";
import { saveStockupSetupIntent } from "@/lib/commerce/stockup-billing";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const headerStore = await headers();
  if (getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) !== "stockup") {
    return NextResponse.json({ error: "Auto-Restock is only available on StockUp" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to save a card" }, { status: 401 });
  }

  let setupIntentId = "";
  try {
    const body = (await request.json()) as { setupIntentId?: string };
    setupIntentId = body.setupIntentId?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid card setup" }, { status: 400 });
  }
  if (!setupIntentId.startsWith("seti_")) {
    return NextResponse.json({ error: "Invalid card setup" }, { status: 400 });
  }

  try {
    const card = await saveStockupSetupIntent({ userId: user.id, setupIntentId });
    return NextResponse.json({ card });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the card";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
