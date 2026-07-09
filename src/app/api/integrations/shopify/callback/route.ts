import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import {
  exchangeShopifyAccessToken,
  fetchShopifyShopProfile,
  normalizeShopDomain,
  registerShopifyWebhooks,
} from "@/lib/store-integration/providers/shopify";
import { encryptSecret } from "@/lib/store-integration/crypto";
import { saveShopifyIntegration } from "@/lib/store-integration/engine";
import { getShopifyConfig } from "@/lib/store-integration/config";
import { queueNotification } from "@/lib/notification-service/engine";
import { createClient } from "@/lib/supabase/server";

function verifyOAuthHmac(searchParams: URLSearchParams, secret: string) {
  const hmac = searchParams.get("hmac");
  if (!hmac) return false;

  const entries = [...searchParams.entries()]
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const digest = createHmac("sha256", secret).update(entries).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { apiSecret, appUrl, isConfigured } = getShopifyConfig();
  if (!isConfigured) {
    return NextResponse.redirect(
      new URL("/partner/affiliate-program?tab=integration&error=not_configured", request.url)
    );
  }

  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const shop = params.get("shop");

  const savedState = request.cookies.get("shopify_oauth_state")?.value;
  const partnerId = request.cookies.get("shopify_oauth_partner_id")?.value;
  const savedShop = request.cookies.get("shopify_oauth_shop")?.value;

  if (!code || !state || !shop || !partnerId || state !== savedState) {
    return NextResponse.redirect(
      new URL("/partner/affiliate-program?tab=integration&error=oauth_failed", request.url)
    );
  }

  if (!verifyOAuthHmac(params, apiSecret)) {
    return NextResponse.redirect(
      new URL("/partner/affiliate-program?tab=integration&error=invalid_hmac", request.url)
    );
  }

  const shopDomain = normalizeShopDomain(savedShop ?? shop);

  try {
    const tokenResponse = await exchangeShopifyAccessToken(shopDomain, code);
    const shopProfile = await fetchShopifyShopProfile(shopDomain, tokenResponse.access_token!);

    const supabase = await createClient();
    const { data: partner } = await supabase
      .from("partners")
      .select("website_url")
      .eq("id", partnerId)
      .maybeSingle();

    await saveShopifyIntegration({
      partnerId,
      shopDomain,
      storeName: shopProfile?.name ?? shopDomain,
      storeUrl: partner?.website_url ?? shopProfile?.domain ?? null,
      accessTokenEncrypted: encryptSecret(tokenResponse.access_token!),
    });

    await registerShopifyWebhooks(shopDomain, tokenResponse.access_token!, appUrl);

    await queueNotification({
      eventType: "STORE_CONNECTED",
      partnerId,
      payload: { shop_domain: shopDomain },
    });
  } catch {
    return NextResponse.redirect(
      new URL("/partner/affiliate-program?tab=integration&error=connect_failed", request.url)
    );
  }

  const response = NextResponse.redirect(
    new URL("/partner/affiliate-program?tab=integration&connected=1", request.url)
  );
  response.cookies.delete("shopify_oauth_state");
  response.cookies.delete("shopify_oauth_partner_id");
  response.cookies.delete("shopify_oauth_shop");
  return response;
}
