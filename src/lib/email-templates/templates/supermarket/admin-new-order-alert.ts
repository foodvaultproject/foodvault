import { STOCKUP_ORIGIN } from "@/lib/app-mode";
import { shortOrderId } from "@/lib/admin/picker-shared";
import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailDetailRow,
  emailHeading,
  emailList,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import { sendPlatformEmailSafe } from "@/lib/email-templates/send";
import type { RenderedEmail } from "@/lib/email-templates/types";
import { formatNzPrice } from "@/lib/partner-offer";
import type { FoodVaultOrder } from "@/types/commerce";

const ADMIN_ORDER_ALERT_EMAIL =
  process.env.PARTNER_SUBMISSION_ADMIN_EMAIL?.trim() || "mark@benchmark-int.com";

export function renderAdminNewOrderAlertEmail(input: {
  order: FoodVaultOrder;
  deliveryNotes?: string | null;
  pickerUrl: string;
}): RenderedEmail {
  const shortId = shortOrderId(input.order.id);
  const customerName = input.order.shipping?.name?.trim() || "Customer";
  const customerEmail = input.order.shipping_email?.trim() || "No email on the order";
  const notes = input.deliveryNotes?.trim() || "None";
  const items = input.order.items ?? [];
  const itemLines =
    items.length > 0
      ? items.map((item) => `${escapeHtml(item.name)} × ${item.quantity}`)
      : ["No line items were saved."];
  const textItems =
    items.length > 0
      ? items.map((item) => `${item.name} × ${item.quantity}`)
      : ["No line items were saved."];

  const subject = `New StockUp order #${shortId} to pick`;
  const content = [
    emailHeading(`New order #${escapeHtml(shortId)}`),
    emailParagraph("A supermarket order is authorized and waiting in the pick queue."),
    emailDetailRow("Customer", `${customerName} (${customerEmail})`),
    emailDetailRow("Order ID", input.order.id),
    emailDetailRow("Hold amount", formatNzPrice(input.order.total)),
    emailParagraph("<strong>Items</strong>"),
    emailList(itemLines),
    emailDetailRow("Delivery notes", notes),
    emailButton(input.pickerUrl, "Open the pick queue"),
  ].join("");

  const text = [
    `New StockUp order #${shortId} is ready to pick.`,
    `Customer: ${customerName} (${customerEmail})`,
    `Order ID: ${input.order.id}`,
    `Hold amount: ${formatNzPrice(input.order.total)}`,
    "Items:",
    ...textItems.map((line) => `- ${line}`),
    `Delivery notes: ${notes}`,
    `Pick queue: ${input.pickerUrl}`,
  ].join("\n");

  return {
    subject,
    html: wrapEmailContent(
      STOCKUP_ORIGIN,
      content,
      `Order #${shortId} from ${customerName} is waiting to be picked.`
    ),
    text,
  };
}

export async function sendAdminNewOrderAlertEmail(input: {
  order: FoodVaultOrder;
  deliveryNotes?: string | null;
}) {
  const pickerUrl = `${STOCKUP_ORIGIN}/admin/picker/${input.order.id}`;
  const result = await sendPlatformEmailSafe({
    to: ADMIN_ORDER_ALERT_EMAIL,
    rendered: renderAdminNewOrderAlertEmail({ ...input, pickerUrl }),
  });
  if (!result.sent) {
    console.error("[vault-market] Admin order alert email was not sent", {
      orderId: input.order.id,
      reason: result.reason,
    });
  }
  return result;
}
