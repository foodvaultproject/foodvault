import { shortOrderId } from "@/lib/admin/picker-shared";
import { formatOrderPlacedAt } from "@/lib/commerce/order-display";
import { escapeHtml } from "@/lib/email-templates/layout/components";
import { SUPERMARKET_EMAIL } from "@/lib/email-templates/layout/supermarket-layout";
import type { EmailAttachment } from "@/lib/email-templates/types";
import { formatNzPrice } from "@/lib/partner-offer";

export type TaxInvoiceLine = {
  name: string;
  sku?: string | null;
  ordered: number;
  picked: number;
  unitPrice: number;
  lineTotal: number;
};

export type TaxInvoiceInput = {
  orderId: string;
  orderDate: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  addressLines: string[];
  trackingNumber?: string | null;
  lines: TaxInvoiceLine[];
  subtotal: number;
  shippingCost: number;
  capturedTotal: number;
};

export function gstIncluded(total: number) {
  return Math.round(((total * 3) / 23) * 100) / 100;
}

function addressBlock(lines: string[]) {
  return lines.filter(Boolean).map((line) => escapeHtml(line)).join("<br />");
}

export function taxInvoicePrintButton(href: string, label = "Download / Print Tax Invoice") {
  const safeHref = escapeHtml(href);
  const green = SUPERMARKET_EMAIL.primary;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="border-radius:6px;background-color:${green};">
          <a href="${safeHref}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;font-size:12px;line-height:1.5;color:#6b7280;">Opens the tax invoice in your browser so you can Save as PDF. If the button does not load, use this link: <a href="${safeHref}" style="color:${SUPERMARKET_EMAIL.primaryDark};word-break:break-all;">${safeHref}</a></p>`;
}

export function invoiceDocumentHtml(
  input: TaxInvoiceInput,
  variant: "admin" | "customer" = "customer"
) {
  const shortId = shortOrderId(input.orderId);
  const customerName = input.customerName?.trim() || "Customer";
  const gst = gstIncluded(input.capturedTotal);
  const tracking = input.trackingNumber?.trim() || "";
  const ink = SUPERMARKET_EMAIL.foreground;
  const border = "#111827";
  const title = variant === "admin" ? "TAX INVOICE / PACKING SLIP" : "TAX INVOICE";

  const itemRows = input.lines
    .map((line) => {
      const sku = line.sku?.trim() || "—";
      if (variant === "customer") {
        return `<tr>
        <td style="padding:8px 6px;border-bottom:1px solid #d1d5db;font-size:13px;">${escapeHtml(line.name)}</td>
        <td align="center" style="padding:8px 6px;border-bottom:1px solid #d1d5db;font-size:13px;font-weight:700;">${line.picked}</td>
        <td align="right" style="padding:8px 6px;border-bottom:1px solid #d1d5db;font-size:13px;">${escapeHtml(formatNzPrice(line.unitPrice))}</td>
        <td align="right" style="padding:8px 6px;border-bottom:1px solid #d1d5db;font-size:13px;font-weight:700;">${escapeHtml(formatNzPrice(line.lineTotal))}</td>
      </tr>`;
      }
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

  const headerRow =
    variant === "customer"
      ? `<tr>
        <th align="left" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Product</th>
        <th align="center" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Qty supplied</th>
        <th align="right" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Unit price</th>
        <th align="right" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Line total</th>
      </tr>`
      : `<tr>
        <th align="left" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Product</th>
        <th align="left" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">SKU</th>
        <th align="center" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Qty ordered</th>
        <th align="center" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Qty picked</th>
        <th align="right" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Unit price</th>
        <th align="right" style="padding:8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${border};">Line total</th>
      </tr>`;

  return `
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;letter-spacing:0.04em;color:${ink};">${title}</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111827;">
      <strong>Britomart Groceries Limited t/a StockUp</strong><br />
      17 Galway Street, Auckland Central, Auckland, 1010, NZ<br />
      GST No: 140-493-740
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      <tr>
        <td width="50%" valign="top" style="padding-right:12px;font-size:13px;line-height:1.6;color:#111827;">
          <strong style="display:block;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;">Bill / deliver to</strong>
          ${escapeHtml(customerName)}<br />
          ${input.customerEmail?.trim() ? `${escapeHtml(input.customerEmail.trim())}<br />` : ""}
          ${input.customerPhone?.trim() ? `${escapeHtml(input.customerPhone.trim())}<br />` : ""}
          ${addressBlock(input.addressLines) || "No shipping address on file."}
        </td>
        <td width="50%" valign="top" style="font-size:13px;line-height:1.6;color:#111827;">
          <strong style="display:block;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;">Order</strong>
          Order date: ${escapeHtml(formatOrderPlacedAt(input.orderDate))}<br />
          Order ID: ${escapeHtml(shortId)}<br />
          ${tracking ? `Tracking number: ${escapeHtml(tracking)}` : "Tracking number: —"}
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-top:2px solid ${border};">
      ${headerRow}
      ${itemRows}
    </table>
    <table role="presentation" width="280" align="right" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      <tr>
        <td style="padding:4px 0;font-size:14px;">Subtotal</td>
        <td align="right" style="padding:4px 0;font-size:14px;">${escapeHtml(formatNzPrice(input.subtotal))}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:14px;">Freight</td>
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
}

export function standaloneInvoiceHtml(
  input: TaxInvoiceInput,
  variant: "admin" | "customer" = "customer"
) {
  const shortId = shortOrderId(input.orderId);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>StockUp Tax Invoice #${escapeHtml(shortId)}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { margin: 0; padding: 24px; font-family: Arial, Helvetica, sans-serif; color: #111827; background: #fff; }
    </style>
  </head>
  <body>
    ${invoiceDocumentHtml(input, variant)}
  </body>
</html>`;
}

export function taxInvoiceAttachment(
  input: TaxInvoiceInput,
  variant: "admin" | "customer" = "customer"
): EmailAttachment {
  const shortId = shortOrderId(input.orderId);
  return {
    filename: `StockUp-Tax-Invoice-${shortId}.html`,
    content: Buffer.from(standaloneInvoiceHtml(input, variant), "utf8"),
    contentType: "text/html; charset=utf-8",
  };
}
