import { renderSupermarketOrderEmail } from "@/lib/email-templates/templates/supermarket/order-confirmed";
import { getEmailAppUrl, sendPlatformEmailSafe } from "@/lib/email-templates/send";
import type { FoodVaultOrder } from "@/types/commerce";

function supermarketAppUrl() {
  const configured = getEmailAppUrl().trim();
  if (
    !configured ||
    configured.includes("localhost") ||
    configured.includes("127.0.0.1")
  ) {
    return "https://www.foodvault.co.nz";
  }
  return configured.replace(/\/$/, "");
}

export async function sendSupermarketOrderConfirmationEmail(order: FoodVaultOrder) {
  const to = order.shipping_email?.trim() ?? "";
  if (!to) {
    console.warn("[vault-market] Order confirmation skipped — no recipient email", {
      orderId: order.id,
    });
    return { sent: false as const, reason: "invalid_recipient" as const };
  }

  const rendered = renderSupermarketOrderEmail(order, supermarketAppUrl());
  const result = await sendPlatformEmailSafe({ to, rendered });
  if (!result.sent) {
    console.error("[vault-market] Order confirmation email was not sent", {
      orderId: order.id,
      reason: result.reason,
    });
  }
  return result;
}
