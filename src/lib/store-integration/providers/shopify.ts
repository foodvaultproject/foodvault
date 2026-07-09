import { createHmac, timingSafeEqual } from "crypto";
import type {
  NormalizedOrderEvent,
  NormalizedOrderLineItem,
  NormalizedRefundEvent,
} from "@/lib/store-integration/types";
import { FV_REF_PARAM } from "@/lib/store-integration/config";

type ShopifyOrder = {
  id?: number | string;
  name?: string;
  order_number?: number;
  created_at?: string;
  total_price?: string;
  currency?: string;
  financial_status?: string;
  cancel_reason?: string | null;
  note_attributes?: { name?: string; value?: string }[];
  note?: string | null;
  tags?: string | null;
  line_items?: {
    title?: string;
    sku?: string | null;
    quantity?: number;
    price?: string;
  }[];
};

function extractSessionToken(order: ShopifyOrder): { token: string | null; method: string | null } {
  const noteAttributes = order.note_attributes ?? [];
  for (const attribute of noteAttributes) {
    if (attribute.name?.toLowerCase() === FV_REF_PARAM && attribute.value?.trim()) {
      return { token: attribute.value.trim(), method: "order_attribute" };
    }
  }

  const note = order.note ?? "";
  const noteMatch = note.match(/fv_ref=([a-f0-9]{32})/i);
  if (noteMatch?.[1]) {
    return { token: noteMatch[1], method: "order_note" };
  }

  const tags = order.tags ?? "";
  const tagMatch = tags.match(/fv_ref:([a-f0-9]{32})/i);
  if (tagMatch?.[1]) {
    return { token: tagMatch[1], method: "order_tag" };
  }

  return { token: null, method: null };
}

function mapLineItems(order: ShopifyOrder): NormalizedOrderLineItem[] {
  return (order.line_items ?? []).map((item) => {
    const quantity = item.quantity ?? 1;
    const unitPrice = Number(item.price ?? 0);
    return {
      productTitle: item.title ?? "Item",
      sku: item.sku ?? null,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    };
  });
}

export function normalizeShopifyOrder(order: ShopifyOrder): NormalizedOrderEvent {
  const { token, method } = extractSessionToken(order);
  const orderNumber = order.name ?? `#${order.order_number ?? order.id ?? "unknown"}`;

  return {
    externalOrderId: String(order.id ?? orderNumber),
    orderNumber,
    orderDate: order.created_at ?? new Date().toISOString(),
    grossTotal: Number(order.total_price ?? 0),
    currency: (order.currency ?? "NZD").toUpperCase(),
    externalStatus: order.financial_status ?? "open",
    sessionToken: token,
    attributionMethod: method,
    lineItems: mapLineItems(order),
    rawPayload: order as Record<string, unknown>,
  };
}

export function normalizeShopifyRefund(
  order: ShopifyOrder,
  refund?: { id?: number | string; transactions?: { amount?: string }[] }
): NormalizedRefundEvent {
  const refundAmount = (refund?.transactions ?? []).reduce(
    (sum, tx) => sum + Number(tx.amount ?? 0),
    0
  );

  return {
    externalOrderId: String(order.id ?? order.name ?? ""),
    externalRefundId: refund?.id != null ? String(refund.id) : null,
    refundAmount,
    externalStatus: "refunded",
    rawPayload: { order, refund } as Record<string, unknown>,
  };
}

export function verifyShopifyWebhookHmac(
  rawBody: string,
  hmacHeader: string | null,
  secret: string
): boolean {
  if (!hmacHeader) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}

export function normalizeShopDomain(input: string): string {
  const trimmed = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (trimmed.includes(".")) {
    return trimmed;
  }
  return `${trimmed}.myshopify.com`;
}

export function buildShopifyOAuthUrl(shop: string, state: string) {
  const { apiKey, redirectUri, appUrl } = getShopifyOAuthConfig();
  const shopDomain = normalizeShopDomain(shop);
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: "read_orders,read_all_orders",
    redirect_uri: redirectUri,
    state,
  });
  return `https://${shopDomain}/admin/oauth/authorize?${params.toString()}`;
}

function getShopifyOAuthConfig() {
  const apiKey = process.env.SHOPIFY_API_KEY ?? "";
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    apiKey,
    redirectUri: `${appUrl.replace(/\/$/, "")}/api/integrations/shopify/callback`,
    appUrl,
  };
}

export async function exchangeShopifyAccessToken(shop: string, code: string) {
  const apiKey = process.env.SHOPIFY_API_KEY ?? "";
  const apiSecret = process.env.SHOPIFY_API_SECRET ?? "";
  const shopDomain = normalizeShopDomain(shop);

  const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Shopify access token");
  }

  const data = (await response.json()) as { access_token?: string; scope?: string };
  if (!data.access_token) {
    throw new Error("Shopify access token missing");
  }

  return data;
}

export async function registerShopifyWebhooks(
  shopDomain: string,
  accessToken: string,
  callbackBaseUrl: string
) {
  const topics = [
    "orders/create",
    "orders/paid",
    "orders/cancelled",
    "orders/updated",
    "refunds/create",
  ];

  for (const topic of topics) {
    await fetch(`https://${shopDomain}/admin/api/2024-10/webhooks.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        webhook: {
          topic,
          address: `${callbackBaseUrl.replace(/\/$/, "")}/api/webhooks/shopify`,
          format: "json",
        },
      }),
    });
  }
}

export async function fetchShopifyShopProfile(shopDomain: string, accessToken: string) {
  const response = await fetch(`https://${shopDomain}/admin/api/2024-10/shop.json`, {
    headers: { "X-Shopify-Access-Token": accessToken },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Shopify shop profile");
  }

  const data = (await response.json()) as {
    shop?: { name?: string; domain?: string; myshopify_domain?: string; id?: number };
  };

  return data.shop;
}
