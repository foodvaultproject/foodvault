import { createAdminClient } from "@/lib/supabase/admin";
import { queueNotification } from "@/lib/notification-service/engine";
import type { NormalizedOrderEvent, NormalizedRefundEvent } from "@/lib/store-integration/types";

export async function ingestNormalizedOrder(
  integrationId: string,
  platform: string,
  order: NormalizedOrderEvent
) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Admin client unavailable");
  }

  const { data, error } = await admin.rpc("ingest_store_order", {
    p_integration_id: integrationId,
    p_platform: platform,
    p_external_order_id: order.externalOrderId,
    p_order_number: order.orderNumber,
    p_order_date: order.orderDate,
    p_gross_total: order.grossTotal,
    p_currency: order.currency,
    p_external_status: order.externalStatus,
    p_session_token: order.sessionToken,
    p_attribution_method: order.attributionMethod,
    p_line_items: order.lineItems,
    p_raw_payload: order.rawPayload,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as Record<string, unknown>;
}

export async function updateNormalizedOrderStatus(
  integrationId: string,
  event: NormalizedRefundEvent | { externalOrderId: string; externalStatus: string }
) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Admin client unavailable");
  }

  const refundAmount = "refundAmount" in event ? event.refundAmount : null;
  const externalRefundId = "externalRefundId" in event ? event.externalRefundId : null;

  const { data, error } = await admin.rpc("update_store_order_status", {
    p_integration_id: integrationId,
    p_external_order_id: event.externalOrderId,
    p_external_status: event.externalStatus,
    p_refund_amount: refundAmount,
    p_external_refund_id: externalRefundId,
    p_raw_payload: event.rawPayload ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as Record<string, unknown>;
}

export async function approveExpiredCommissions() {
  const admin = createAdminClient();
  if (!admin) return 0;

  const { data, error } = await admin.rpc("approve_expired_commissions");
  if (error) {
    throw new Error(error.message);
  }

  return Number(data ?? 0);
}

export async function logStoreWebhook(input: {
  integrationId: string | null;
  platform: string;
  topic: string;
  externalId: string | null;
  status: string;
  errorMessage?: string | null;
  rawPayload: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  if (!admin) return;

  await admin.from("store_webhook_logs").insert({
    integration_id: input.integrationId,
    platform: input.platform,
    topic: input.topic,
    external_id: input.externalId,
    status: input.status,
    error_message: input.errorMessage ?? null,
    raw_payload: input.rawPayload,
    processed_at: input.status === "processed" ? new Date().toISOString() : null,
  });
}

export async function findIntegrationByShopDomain(shopDomain: string) {
  const admin = createAdminClient();
  if (!admin) return null;

  const normalized = shopDomain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const { data } = await admin
    .from("store_integrations")
    .select("id, partner_id, external_store_id, webhook_secret, status, platform")
    .eq("platform", "shopify")
    .eq("external_store_id", normalized)
    .order("connected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function saveShopifyIntegration(input: {
  partnerId: string;
  shopDomain: string;
  storeName: string;
  storeUrl: string | null;
  accessTokenEncrypted: string;
}) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Admin client unavailable");
  }

  const { data, error } = await admin
    .from("store_integrations")
    .upsert(
      {
        partner_id: input.partnerId,
        platform: "shopify",
        store_name: input.storeName,
        store_url: input.storeUrl,
        external_store_id: input.shopDomain,
        access_token_encrypted: input.accessTokenEncrypted,
        status: "connected",
        connected_at: new Date().toISOString(),
        disconnected_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "partner_id,platform,external_store_id" }
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function disconnectStoreIntegration(partnerId: string, platform: string) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Admin client unavailable");
  }

  const { error } = await admin
    .from("store_integrations")
    .update({
      status: "disconnected",
      disconnected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("partner_id", partnerId)
    .eq("platform", platform);

  if (error) {
    throw new Error(error.message);
  }

  await queueNotification({
    eventType: "STORE_DISCONNECTED",
    partnerId,
    payload: { platform },
  });
}
