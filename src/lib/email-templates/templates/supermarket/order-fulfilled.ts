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

export type PackedOrderLine = {
  name: string;
  ordered: number;
  picked: number;
  lineTotal: number;
};

function trackingUrl(code: string) {
  return `https://www.nzpost.co.nz/tools/tracking?trackid=${encodeURIComponent(code.trim())}`;
}

export function renderSupermarketOrderFulfilledEmail(input: {
  orderId: string;
  customerName?: string | null;
  lines: PackedOrderLine[];
  shippingCost: number;
  capturedTotal: number;
  trackingNumber?: string | null;
  appUrl: string;
}): RenderedEmail {
  const shortId = shortOrderId(input.orderId);
  const site = input.appUrl.replace(/\/$/, "");
  const ordersUrl = `${site}/account/orders`;
  const greeting = input.customerName?.trim()
    ? `Kia ora ${escapeHtml(input.customerName.trim())},`
    : "Kia ora,";
  const tracking = input.trackingNumber?.trim() || "";
  const freight = Math.max(0, input.shippingCost);

  const itemRows = input.lines
    .map((line) => {
      const outOfStock = line.picked <= 0;
      const detail = outOfStock
        ? "Out of stock · not charged"
        : `Picked ${line.picked} of ${line.ordered}`;
      const amount = outOfStock ? "$0.00" : formatNzPrice(line.lineTotal);
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${SUPERMARKET_EMAIL.border};font-size:14px;color:${outOfStock ? EMAIL_BRAND.muted : EMAIL_BRAND.foreground};${outOfStock ? "text-decoration:line-through;" : ""}">${escapeHtml(line.name)}<br /><span style="color:${EMAIL_BRAND.muted};font-size:12px;text-decoration:none;display:inline-block;">${escapeHtml(detail)}</span></td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid ${SUPERMARKET_EMAIL.border};font-size:14px;font-weight:700;color:${outOfStock ? EMAIL_BRAND.muted : SUPERMARKET_EMAIL.foreground};">${escapeHtml(amount)}</td>
      </tr>`;
    })
    .join("");

  const content = `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:${SUPERMARKET_EMAIL.foreground};">Packed and charged</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.body};">${greeting} your StockUp order has been packed. We charged your card only for the items below.</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.body};"><strong style="color:${SUPERMARKET_EMAIL.foreground};">Order #${escapeHtml(shortId)}</strong></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      ${itemRows}
      <tr>
        <td style="padding:10px 0 0;font-size:14px;color:${EMAIL_BRAND.muted};">Freight</td>
        <td align="right" style="padding:10px 0 0;font-size:14px;">${freight === 0 ? "FREE" : escapeHtml(formatNzPrice(freight))}</td>
      </tr>
      <tr>
        <td style="padding:8px 0 0;font-size:16px;font-weight:700;color:${SUPERMARKET_EMAIL.foreground};">Amount charged</td>
        <td align="right" style="padding:8px 0 0;font-size:16px;font-weight:700;color:${SUPERMARKET_EMAIL.foreground};">${escapeHtml(formatNzPrice(input.capturedTotal))}</td>
      </tr>
    </table>
    ${
      tracking
        ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.body};"><strong style="color:${SUPERMARKET_EMAIL.foreground};">Tracking</strong><br /><a href="${escapeHtml(trackingUrl(tracking))}" style="color:${SUPERMARKET_EMAIL.primaryDark};font-weight:700;text-decoration:none;">${escapeHtml(tracking)}</a></p>`
        : ""
    }
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 12px;">
      <tr>
        <td style="border-radius:6px;background-color:${SUPERMARKET_EMAIL.primary};">
          <a href="${escapeHtml(ordersUrl)}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">View your orders</a>
        </td>
      </tr>
    </table>
  `;

  const text = [
    `Your StockUp order #${shortId} has been packed and charged.`,
    ...input.lines.map((line) =>
      line.picked <= 0
        ? `${line.name}: out of stock, not charged ($0.00)`
        : `${line.name}: picked ${line.picked} of ${line.ordered}, ${formatNzPrice(line.lineTotal)}`
    ),
    freight === 0 ? "Freight: FREE" : `Freight: ${formatNzPrice(freight)}`,
    `Amount charged: ${formatNzPrice(input.capturedTotal)}`,
    tracking ? `Tracking: ${tracking}` : "",
    `View your orders: ${ordersUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Your StockUp Order #${shortId} Has Been Packed & Charged!`,
    html: renderSupermarketEmailLayout({
      appUrl: site,
      content,
      preheader: `Order #${shortId} is packed. We charged ${formatNzPrice(input.capturedTotal)}.`,
    }),
    text,
  };
}

export async function sendSupermarketOrderFulfilledEmail(input: {
  to: string;
  orderId: string;
  customerName?: string | null;
  lines: PackedOrderLine[];
  shippingCost: number;
  capturedTotal: number;
  trackingNumber?: string | null;
}) {
  const to = input.to.trim();
  if (!to) {
    console.warn("[vault-market] Packed order email skipped — no recipient", {
      orderId: input.orderId,
    });
    return { sent: false as const, reason: "invalid_recipient" as const };
  }

  const result = await sendPlatformEmailSafe({
    to,
    rendered: renderSupermarketOrderFulfilledEmail({
      ...input,
      appUrl: supermarketEmailAppUrl(),
    }),
  });
  if (!result.sent) {
    console.error("[vault-market] Packed order email was not sent", {
      orderId: input.orderId,
      reason: result.reason,
    });
  }
  return result;
}
