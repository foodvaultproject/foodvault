import { SUPERMARKET_EMAIL, renderSupermarketEmailLayout } from "@/lib/email-templates/layout/supermarket-layout";
import { EMAIL_BRAND } from "@/lib/email-templates/brand";
import { escapeHtml } from "@/lib/email-templates/layout/components";
import { formatOrderPlacedAt } from "@/lib/commerce/order-display";
import { formatNzPrice } from "@/lib/partner-offer";
import type { RenderedEmail } from "@/lib/email-templates/types";
import type { FoodVaultOrder } from "@/types/commerce";

export function renderSupermarketOrderEmail(
  order: FoodVaultOrder,
  appUrl: string
): RenderedEmail {
  const site = appUrl.replace(/\/$/, "");
  const ordersUrl = `${site}/account/orders`;
  const shopUrl = `${site}/`;
  const placedAt = formatOrderPlacedAt(order.created_at);
  const shortId = order.id.replace(/-/g, "").slice(-8).toUpperCase() || order.id.slice(0, 8);
  const freight = Math.max(0, order.shipping_cost ?? order.total - order.subtotal);
  const recipientName = order.shipping?.name?.trim();
  const greeting = recipientName ? `Kia ora ${escapeHtml(recipientName)},` : "Kia ora,";
  const address = [
    order.shipping?.name,
    order.shipping?.line1,
    order.shipping?.line2,
    [order.shipping?.city, order.shipping?.postal_code].filter(Boolean).join(" "),
    order.shipping?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const itemRows = (order.items ?? [])
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${SUPERMARKET_EMAIL.border};font-size:14px;color:${EMAIL_BRAND.foreground};">${escapeHtml(item.name)}<br /><span style="color:${EMAIL_BRAND.muted};font-size:12px;">Qty ${item.quantity}</span></td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid ${SUPERMARKET_EMAIL.border};font-size:14px;font-weight:700;color:${SUPERMARKET_EMAIL.foreground};">${escapeHtml(formatNzPrice(item.line_total))}</td>
      </tr>`
    )
    .join("");

  const content = `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:${SUPERMARKET_EMAIL.foreground};">Payment received</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.body};">${greeting} your FoodVault supermarket order is confirmed and your payment has been received.</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.body};"><strong style="color:${SUPERMARKET_EMAIL.foreground};">Order #${escapeHtml(shortId)}</strong><br />Placed ${escapeHtml(placedAt)} (New Zealand time)</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      ${itemRows}
      <tr>
        <td style="padding:10px 0 0;font-size:14px;color:${EMAIL_BRAND.muted};">Subtotal</td>
        <td align="right" style="padding:10px 0 0;font-size:14px;">${escapeHtml(formatNzPrice(order.subtotal))}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:${EMAIL_BRAND.muted};">Freight</td>
        <td align="right" style="padding:6px 0;font-size:14px;">${freight === 0 ? "FREE" : escapeHtml(formatNzPrice(freight))}</td>
      </tr>
      <tr>
        <td style="padding:8px 0 0;font-size:16px;font-weight:700;color:${SUPERMARKET_EMAIL.foreground};">Total paid</td>
        <td align="right" style="padding:8px 0 0;font-size:16px;font-weight:700;color:${SUPERMARKET_EMAIL.foreground};">${escapeHtml(formatNzPrice(order.total))}</td>
      </tr>
    </table>
    ${
      (order.total_savings ?? 0) > 0
        ? `<p style="margin:0 0 16px;font-size:14px;font-weight:700;color:${SUPERMARKET_EMAIL.primaryDark};">You saved ${escapeHtml(formatNzPrice(order.total_savings ?? 0))} on this order.</p>`
        : ""
    }
    ${
      address
        ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.body};"><strong style="color:${SUPERMARKET_EMAIL.foreground};">Delivering to</strong><br />${escapeHtml(address)}</p>`
        : ""
    }
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 12px;">
      <tr>
        <td style="border-radius:6px;background-color:${SUPERMARKET_EMAIL.primary};">
          <a href="${escapeHtml(ordersUrl)}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">View your orders</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.muted};">You can also keep shopping at <a href="${escapeHtml(shopUrl)}" style="color:${SUPERMARKET_EMAIL.primaryDark};font-weight:700;text-decoration:none;">foodvault.co.nz</a>.</p>
  `;

  const text = [
    `Payment received. Your FoodVault supermarket order #${shortId} is confirmed.`,
    `Placed ${placedAt} (New Zealand time).`,
    `Total paid ${formatNzPrice(order.total)}.`,
    address ? `Delivering to ${address}.` : "",
    `View your orders: ${ordersUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Payment received — FoodVault order #${shortId}`,
    html: renderSupermarketEmailLayout({
      appUrl: site,
      content,
      preheader: `Your payment was received and order #${shortId} is confirmed.`,
    }),
    text,
  };
}
