import { NextRequest, NextResponse } from "next/server";
import {
  normalizeShopifyOrder,
  normalizeShopifyRefund,
  verifyShopifyWebhookHmac,
} from "@/lib/store-integration/providers/shopify";
import {
  approveExpiredCommissions,
  findIntegrationByShopDomain,
  ingestNormalizedOrder,
  logStoreWebhook,
  updateNormalizedOrderStatus,
} from "@/lib/store-integration/engine";
import { getShopifyConfig } from "@/lib/store-integration/config";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const topic = request.headers.get("x-shopify-topic") ?? "unknown";
  const shopDomain = request.headers.get("x-shopify-shop-domain") ?? "";
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  const { apiSecret } = getShopifyConfig();

  if (!verifyShopifyWebhookHmac(rawBody, hmac, apiSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const integration = await findIntegrationByShopDomain(shopDomain);
  if (!integration || integration.status !== "connected") {
    await logStoreWebhook({
      integrationId: integration?.id ?? null,
      platform: "shopify",
      topic,
      externalId: null,
      status: "ignored",
      errorMessage: "Integration not connected",
      rawPayload: payload,
    });
    return NextResponse.json({ ok: true, ignored: true }, { status: 202 });
  }

  void processWebhookAsync(String(integration.id), topic, payload);

  return NextResponse.json({ ok: true }, { status: 202 });
}

async function processWebhookAsync(
  integrationId: string,
  topic: string,
  payload: Record<string, unknown>
) {
  try {
    await approveExpiredCommissions();

    if (topic === "orders/create" || topic === "orders/paid" || topic === "orders/updated") {
      const order = normalizeShopifyOrder(payload as Parameters<typeof normalizeShopifyOrder>[0]);
      if (topic === "orders/paid" || order.externalStatus === "paid") {
        await ingestNormalizedOrder(integrationId, "shopify", order);
      } else if (topic === "orders/create") {
        await ingestNormalizedOrder(integrationId, "shopify", {
          ...order,
          externalStatus: order.externalStatus || "open",
        });
      }
    } else if (topic === "orders/cancelled") {
      const order = normalizeShopifyOrder(payload as Parameters<typeof normalizeShopifyOrder>[0]);
      await updateNormalizedOrderStatus(integrationId, {
        externalOrderId: order.externalOrderId,
        externalStatus: "cancelled",
        rawPayload: payload,
      });
    } else if (topic === "refunds/create") {
      const orderPayload = (payload.order ?? payload) as Parameters<typeof normalizeShopifyOrder>[0];
      const order = normalizeShopifyOrder(orderPayload);
      const refund = normalizeShopifyRefund(orderPayload, payload as Parameters<typeof normalizeShopifyRefund>[1]);
      await updateNormalizedOrderStatus(integrationId, refund);
    }

    await logStoreWebhook({
      integrationId,
      platform: "shopify",
      topic,
      externalId: String(payload.id ?? ""),
      status: "processed",
      rawPayload: payload,
    });
  } catch (error) {
    await logStoreWebhook({
      integrationId,
      platform: "shopify",
      topic,
      externalId: String(payload.id ?? ""),
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      rawPayload: payload,
    });
  }
}
