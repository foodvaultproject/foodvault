export const SHOPIFY_SCOPES = ["read_orders", "read_all_orders"].join(",");

export function getShopifyConfig() {
  const apiKey = process.env.SHOPIFY_API_KEY ?? "";
  const apiSecret = process.env.SHOPIFY_API_SECRET ?? "";
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    apiKey,
    apiSecret,
    appUrl,
    redirectUri: `${appUrl.replace(/\/$/, "")}/api/integrations/shopify/callback`,
    isConfigured: Boolean(apiKey && apiSecret),
  };
}

export const COMMISSION_HOLD_DAYS = 30;

export const FV_REF_COOKIE = "fv_ref";
export const FV_REF_PARAM = "fv_ref";
