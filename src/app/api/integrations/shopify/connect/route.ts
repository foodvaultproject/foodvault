import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildShopifyOAuthUrl, normalizeShopDomain } from "@/lib/store-integration/providers/shopify";
import { getShopifyConfig } from "@/lib/store-integration/config";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  const { isConfigured } = getShopifyConfig();
  if (!isConfigured) {
    return NextResponse.json({ error: "Shopify integration is not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/partner/login", request.url));
  }

  const shop = request.nextUrl.searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!partner) {
    return NextResponse.json({ error: "Partner account required" }, { status: 403 });
  }

  const state = randomBytes(16).toString("hex");
  const shopDomain = normalizeShopDomain(shop);

  const response = NextResponse.redirect(buildShopifyOAuthUrl(shopDomain, state));
  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  response.cookies.set("shopify_oauth_partner_id", String(partner.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  response.cookies.set("shopify_oauth_shop", shopDomain, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
