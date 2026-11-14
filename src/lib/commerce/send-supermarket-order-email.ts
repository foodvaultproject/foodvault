import { STOCKUP_ORIGIN } from "@/lib/app-mode";
import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailHeading,
  emailParagraph,
} from "@/lib/email-templates/layout/components";
import { sendAdminNewOrderAlertEmail } from "@/lib/email-templates/templates/supermarket/admin-new-order-alert";
import { renderSupermarketOrderEmail } from "@/lib/email-templates/templates/supermarket/order-confirmed";
import { SUPERMARKET_EMAIL, renderSupermarketEmailLayout } from "@/lib/email-templates/layout/supermarket-layout";
import { sendPlatformEmailSafe } from "@/lib/email-templates/send";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FoodVaultOrder } from "@/types/commerce";

const ADMIN_ORDER_ALERT_EMAIL =
  process.env.PARTNER_SUBMISSION_ADMIN_EMAIL?.trim() || "mark@benchmark-int.com";

export function supermarketEmailAppUrl() {
  return STOCKUP_ORIGIN;
}

export async function sendSupermarketOrderConfirmationEmail(order: FoodVaultOrder) {
  const to = order.shipping_email?.trim() ?? "";
  if (!to) {
    console.warn("[vault-market] Order confirmation skipped — no recipient email", {
      orderId: order.id,
    });
    return { sent: false as const, reason: "invalid_recipient" as const };
  }

  const rendered = renderSupermarketOrderEmail(order, supermarketEmailAppUrl());
  const result = await sendPlatformEmailSafe({ to, brand: "stockup", rendered });
  if (!result.sent) {
    console.error("[vault-market] Order confirmation email was not sent", {
      orderId: order.id,
      reason: result.reason,
    });
  }
  return result;
}

export type OrderEmailFallbacks = {
  stripeEmail?: string | null;
  accountEmail?: string | null;
};

function resolveOrderRecipient(
  order: FoodVaultOrder,
  extras?: OrderEmailFallbacks
) {
  return (
    order.shipping_email?.trim() ||
    extras?.stripeEmail?.trim() ||
    extras?.accountEmail?.trim() ||
    ""
  );
}

/** Sends customer + admin order mail once. Safe to call from the webhook and the success-page poll. */
export async function sendSavedOrderEmails(
  order: FoodVaultOrder,
  extras?: OrderEmailFallbacks
) {
  if (!order.items?.length) return;
  const admin = createAdminClient();
  if (!admin) return;

  const recipient = resolveOrderRecipient(order, extras);
  if (!recipient) {
    console.error("[vault-market] Confirmation skipped — no recipient", {
      orderId: order.id,
    });
    return;
  }

  if (recipient !== (order.shipping_email?.trim() || "")) {
    await admin
      .from("foodvault_orders")
      .update({ shipping_email: recipient })
      .eq("id", order.id);
    order = { ...order, shipping_email: recipient };
  }

  const claim = await admin
    .from("foodvault_orders")
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq("id", order.id)
    .is("confirmation_sent_at", null)
    .select("id")
    .maybeSingle();

  if (claim.error || !claim.data) return;

  try {
    const customer = await sendSupermarketOrderConfirmationEmail(order);
    if (!customer.sent) {
      await admin
        .from("foodvault_orders")
        .update({ confirmation_sent_at: null })
        .eq("id", order.id);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
    const adminAlert = await sendAdminNewOrderAlertEmail({ order });
    if (!adminAlert.sent) {
      console.error("[vault-market] Admin order alert was not sent", {
        orderId: order.id,
        reason: adminAlert.reason,
      });
    }
  } catch (error) {
    await admin
      .from("foodvault_orders")
      .update({ confirmation_sent_at: null })
      .eq("id", order.id);
    console.error("[vault-market] Order notification failed", {
      orderId: order.id,
      error: error instanceof Error ? error.message : error,
    });
  }
}

export async function sendPantryPaymentFailedEmails(order: FoodVaultOrder) {
  const shortId = order.id.replace(/-/g, "").slice(-8).toUpperCase() || order.id.slice(0, 8);
  const customer = order.shipping_email?.trim();

  if (customer) {
    const content = `
      <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:${SUPERMARKET_EMAIL.foreground};">Payment could not be completed</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">We received StockUp order #${shortId}, but the card authorization or capture failed. The order has been cancelled and no charge was taken.</p>
      <p style="margin:0;font-size:15px;line-height:1.6;">Please try checkout again, or contact us if you need a hand.</p>
    `;
    await sendPlatformEmailSafe({
      to: customer,
      brand: "stockup",
      rendered: {
        subject: `Payment failed — StockUp order #${shortId}`,
        html: renderSupermarketEmailLayout({
          appUrl: STOCKUP_ORIGIN,
          content,
          preheader: `Order #${shortId} could not be charged and has been cancelled.`,
        }),
        text: `Payment failed for StockUp order #${shortId}. The order has been cancelled and no charge was taken.`,
      },
    });
  }

  await sendPlatformEmailSafe({
    to: ADMIN_ORDER_ALERT_EMAIL,
    brand: "stockup",
    rendered: {
      subject: `Payment failed — StockUp order #${shortId}`,
      html: wrapEmailContent(
        STOCKUP_ORIGIN,
        [
          emailHeading(`Payment failed for order #${shortId}`),
          emailParagraph(
            "A StockUp supermarket order could not capture or authorize payment. The order is cancelled."
          ),
          emailParagraph(`Order ID: ${order.id}`),
          emailParagraph(`Customer: ${customer || "No email on the order"}`),
        ].join(""),
        `Payment failed for StockUp order #${shortId}.`
      ),
      text: `Payment failed for StockUp order #${shortId} (${order.id}). Customer: ${customer || "none"}.`,
    },
  });
}
