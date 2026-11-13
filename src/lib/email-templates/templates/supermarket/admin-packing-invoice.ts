import { shortOrderId } from "@/lib/admin/picker-shared";
import { supermarketEmailAppUrl } from "@/lib/commerce/send-supermarket-order-email";
import { formatOrderPlacedAt } from "@/lib/commerce/order-display";
import { escapeHtml } from "@/lib/email-templates/layout/components";
import {
  SUPERMARKET_EMAIL,
  renderSupermarketEmailLayout,
} from "@/lib/email-templates/layout/supermarket-layout";
import { sendPlatformEmailSafe } from "@/lib/email-templates/send";
import { formatNzPrice } from "@/lib/partner-offer";

const ADMIN_PACKING_INVOICE_EMAIL =
  process.env.PARTNER_SUBMISSION_ADMIN_EMAIL?.trim() || "mark@benchmark-int.com";

export type PackingInvoiceLine = {
  name: string;
  sku?: string | null;
  ordered: number;
  picked: number;
  unitPrice: number;
  lineTotal: number;
};

function gstIncluded(total: number) {
  return Math.round(((total * 3) / 23) * 100) / 100;
}

function addressBlock(lines: string[]) {
  return lines.filter(Boolean).map((line) => escapeHtml(line)).join("<br />");
}

export function renderAdminPackingInvoiceEmail(input: {
  orderId: string;
  orderDate: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  addressLines: string[];
  trackingNumber?: string | null;
  lines: PackingInvoiceLine[];
  subtotal: number;
  shippingCost: number;
  capturedTotal: number;
  appUrl: string;
}) {
  const shortId = shortOrderId(input.orderId);
  const customerName = input.customerName?.trim() || "Customer";
  const gst = gstIncluded(input.capturedTotal);
  const tracking = input.trackingNumber?.trim() || "";
  const ink = SUPERMARKET_EMAIL.foreground;
  const border = "#111827";

  const itemRows = input.lines
    .map((line) => {
      const sku = line.sku?.trim() || "—";
      return `<tr>
        <td style="padding:8px 6px;border-bottom:1px solid #d1d5db;font-size:13px;">${escapeHtml(line.name)}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #d1d5db;font-size:12px;font-family:ui-monospace,Menlo,monospace;">${escapeHtml(sku)}</td>
        <td align="center" style="padding:8px 6px;border-bottom:1px solid #d1d5db;font-size:13px;">${line.ordered}</td>
        <td align="center" style="padding:8px 6px;border-bottom:1px solid #d1d5db;font-size:13px;font-weight:700;">${line.picked}</td>
        <td align="right" style="padding:8px 6px;border-bottom:1px solid #d1d5db;font-size:13px;">${escapeHtml(formatNzPrice(line.unitPrice))}</td>
        <td align="right" style="padding:8px 6px;border-bottom:1px solid #d1d5db;font-size:13px;font-weight:700;">${escapeHtml(formatNzPrice(line.lineTotal))}</td>
      </tr>`;
    })
    .join("");

  const content = `
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;letter-spacing:0.04em;color:${ink};">TAX INVOICE / PACKING SLIP</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111827;">
      <strong>Britomart Groceries Limited t/a StockUp</strong><br />
      17 Galway Street, Auckland Central, Auckland, 1010, NZ<br />
      GST No: 140-493-740
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      <tr>
        <td width="50%" valign="top" style="padding-right:12px;font-size:13px;line-height:1.6;color:#111827;">
          <strong style="display:block;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;">Deliver to</strong>
          ${escapeHtml(customerName)}<br />
          ${input.customerEmail?.trim() ? `${escapeHtml(input.customerEmail.trim())}<br />` : ""}
          ${input.customerPhone?.trim() ? `${escapeHtml(input.customerPhone.trim())}<br />` : ""}
          ${addressBlock(input.addressLines) || "No shipping address on file."}
        </td>
        <td width="50%" valign="top" style="font-size:13px;line-height:1.6;color:#111827;">
          <strong style="display:block;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;">Order</strong>
          Order date: ${escapeHtml(formatOrderPlacedAt(input.orderDate))}<br />
          Order ID: ${escapeHtml(shortId)}<br />
          ${tracking ? `NZ Post tracking: ${escapeHtml(tracking)}` : "NZ Post tracking: —"}
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-top:2px solid ${border};">
      <tr>
        <th align="left" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Product</th>
        <th align="left" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">SKU</th>
        <th align="center" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Qty ordered</th>
        <th align="center" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Qty picked</th>
        <th align="right" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Unit price</th>
        <th align="right" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Line total</th>
      </tr>
      ${itemRows}
    </table>
    <table role="presentation" width="280" align="right" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      <tr>
        <td style="padding:4px 0;font-size:14px;">Subtotal (picked items)</td>
        <td align="right" style="padding:4px 0;font-size:14px;">${escapeHtml(formatNzPrice(input.subtotal))}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:14px;">Freight / Shipping</td>
        <td align="right" style="padding:4px 0;font-size:14px;">${input.shippingCost === 0 ? "FREE" : escapeHtml(formatNzPrice(input.shippingCost))}</td>
      </tr>
      <tr>
        <td style="padding:8px 0 4px;font-size:16px;font-weight:700;border-top:2px solid ${border};">Total Charged</td>
        <td align="right" style="padding:8px 0 4px;font-size:16px;font-weight:700;border-top:2px solid ${border};">${escapeHtml(formatNzPrice(input.capturedTotal))}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:14px;">Includes GST (15%)</td>
        <td align="right" style="padding:4px 0;font-size:14px;">${escapeHtml(formatNzPrice(gst))}</td>
      </tr>
    </table>
  `;

  const text = [
    "TAX INVOICE / PACKING SLIP",
    "Britomart Groceries Limited t/a StockUp",
    "17 Galway Street, Auckland Central, Auckland, 1010, NZ",
    "GST No: 140-493-740",
    `Order date: ${formatOrderPlacedAt(input.orderDate)}`,
    `Order ID: ${shortId}`,
    tracking ? `NZ Post tracking: ${tracking}` : "",
    `Customer: ${customerName}`,
    input.customerEmail?.trim() || "",
    input.customerPhone?.trim() || "",
    ...input.addressLines,
    ...input.lines.map(
      (line) =>
        `${line.name} (${line.sku?.trim() || "—"}) ordered ${line.ordered} picked ${line.picked} ${formatNzPrice(line.lineTotal)}`
    ),
    `Subtotal ${formatNzPrice(input.subtotal)}`,
    `Freight ${formatNzPrice(input.shippingCost)}`,
    `Total Charged ${formatNzPrice(input.capturedTotal)}`,
    `Includes GST (15%): ${formatNzPrice(gst)}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Packing Slip & Tax Invoice — Order #${shortId} (${customerName})`,
    html: renderSupermarketEmailLayout({
      appUrl: input.appUrl,
      content,
      preheader: `Packing slip and tax invoice for order #${shortId}.`,
    }),
    text,
  };
}

export async function sendAdminPackingInvoiceEmail(input: {
  orderId: string;
  orderDate: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  addressLines: string[];
  trackingNumber?: string | null;
  lines: PackingInvoiceLine[];
  subtotal: number;
  shippingCost: number;
  capturedTotal: number;
}) {
  return sendPlatformEmailSafe({
    to: ADMIN_PACKING_INVOICE_EMAIL,
    rendered: renderAdminPackingInvoiceEmail({
      ...input,
      appUrl: supermarketEmailAppUrl(),
    }),
  });
}
