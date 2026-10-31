import { shortOrderId } from "@/lib/admin/picker-shared";
import { supermarketEmailAppUrl } from "@/lib/commerce/send-supermarket-order-email";
import { EMAIL_BRAND } from "@/lib/email-templates/brand";
import { escapeHtml } from "@/lib/email-templates/layout/components";
import {
  SUPERMARKET_EMAIL,
  renderSupermarketEmailLayout,
} from "@/lib/email-templates/layout/supermarket-layout";
import { sendPlatformEmailSafe } from "@/lib/email-templates/send";
import type { RenderedEmail } from "@/lib/email-templates/types";
import { formatNzPrice } from "@/lib/partner-offer";

export type CanceledOrderLine = {
  name: string;
  ordered: number;
};

export function renderSupermarketOrderCanceledEmail(input: {
  orderId: string;
  customerName?: string | null;
  lines: CanceledOrderLine[];
  releasedHold: number;
  appUrl: string;
}): RenderedEmail {
  const shortId = shortOrderId(input.orderId);
  const site = input.appUrl.replace(/\/$/, "");
  const shopUrl = `${site}/`;
  const greeting = input.customerName?.trim()
    ? `Kia ora ${escapeHtml(input.customerName.trim())},`
    : "Kia ora,";
  const hold = formatNzPrice(input.releasedHold);

  const itemRows = input.lines
    .map(
      (line) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${SUPERMARKET_EMAIL.border};font-size:14px;color:${EMAIL_BRAND.muted};text-decoration:line-through;">${escapeHtml(line.name)}<br /><span style="font-size:12px;text-decoration:none;display:inline-block;">Out of stock · qty ${line.ordered}</span></td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid ${SUPERMARKET_EMAIL.border};font-size:14px;font-weight:700;color:${EMAIL_BRAND.muted};">$0.00</td>
      </tr>`
    )
    .join("");

  const content = `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:${SUPERMARKET_EMAIL.foreground};">Order canceled</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.body};">${greeting} every item on this order was unavailable, so we canceled it. Your card hold of ${escapeHtml(hold)} has been released. Amount charged: $0.00.</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.body};"><strong style="color:${SUPERMARKET_EMAIL.foreground};">Order #${escapeHtml(shortId)}</strong></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      ${itemRows}
      <tr>
        <td style="padding:8px 0 0;font-size:16px;font-weight:700;color:${SUPERMARKET_EMAIL.foreground};">Amount charged</td>
        <td align="right" style="padding:8px 0 0;font-size:16px;font-weight:700;color:${SUPERMARKET_EMAIL.foreground};">$0.00</td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.muted};">You can shop again at <a href="${escapeHtml(shopUrl)}" style="color:${SUPERMARKET_EMAIL.primaryDark};font-weight:700;text-decoration:none;">stockup.co.nz</a>.</p>
  `;

  const text = [
    `StockUp order #${shortId} was canceled because every item was unavailable.`,
    `The card hold of ${hold} has been released.`,
    "Amount charged: $0.00.",
    ...input.lines.map((line) => `${line.name}: out of stock, not charged ($0.00)`),
    `Shop again: ${shopUrl}`,
  ].join("\n");

  return {
    subject: `StockUp Order #${shortId} Canceled - Hold Released`,
    html: renderSupermarketEmailLayout({
      appUrl: site,
      content,
      preheader: `Order #${shortId} was canceled and your card hold was released. You were not charged.`,
    }),
    text,
  };
}

export async function sendSupermarketOrderCanceledEmail(input: {
  to: string;
  orderId: string;
  customerName?: string | null;
  lines: CanceledOrderLine[];
  releasedHold: number;
}) {
  const to = input.to.trim();
  if (!to) {
    console.warn("[vault-market] Canceled order email skipped — no recipient", {
      orderId: input.orderId,
    });
    return { sent: false as const, reason: "invalid_recipient" as const };
  }

  const result = await sendPlatformEmailSafe({
    to,
    rendered: renderSupermarketOrderCanceledEmail({
      ...input,
      appUrl: supermarketEmailAppUrl(),
    }),
  });
  if (!result.sent) {
    console.error("[vault-market] Canceled order email was not sent", {
      orderId: input.orderId,
      reason: result.reason,
    });
  }
  return result;
}
