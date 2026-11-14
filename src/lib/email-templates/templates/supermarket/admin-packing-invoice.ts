import { shortOrderId } from "@/lib/admin/picker-shared";
import { supermarketEmailAppUrl } from "@/lib/commerce/send-supermarket-order-email";
import { formatOrderPlacedAt } from "@/lib/commerce/order-display";
import { renderSupermarketEmailLayout } from "@/lib/email-templates/layout/supermarket-layout";
import { sendPlatformEmailSafe } from "@/lib/email-templates/send";
import type { RenderedEmail } from "@/lib/email-templates/types";
import { formatNzPrice } from "@/lib/partner-offer";
import {
  gstIncluded,
  invoiceDocumentHtml,
  taxInvoicePdfAttachment,
  taxInvoicePrintButton,
  type TaxInvoiceInput,
  type TaxInvoiceLine,
} from "@/lib/email-templates/templates/supermarket/tax-invoice-html";

const ADMIN_PACKING_INVOICE_EMAIL =
  process.env.PARTNER_SUBMISSION_ADMIN_EMAIL?.trim() || "mark@benchmark-int.com";

export type PackingInvoiceLine = TaxInvoiceLine;
type PackingInvoiceInput = TaxInvoiceInput & { appUrl: string };

function packingSlipPrintUrl(appUrl: string, orderId: string) {
  return `${appUrl.replace(/\/$/, "")}/admin/orders/${orderId}/packing-slip?autoprint=1`;
}

export function renderAdminPackingInvoiceEmail(input: PackingInvoiceInput): RenderedEmail {
  const shortId = shortOrderId(input.orderId);
  const customerName = input.customerName?.trim() || "Customer";
  const gst = gstIncluded(input.capturedTotal);
  const printUrl = packingSlipPrintUrl(input.appUrl, input.orderId);
  const document = invoiceDocumentHtml(input, "admin");
  const printCta = taxInvoicePrintButton(printUrl, "Download / Print Tax Invoice (PDF)");

  const text = [
    "TAX INVOICE / PACKING SLIP",
    "Britomart Groceries Limited t/a StockUp",
    "17 Galway Street, Auckland Central, Auckland, 1010, NZ",
    "GST No: 140-493-740",
    `Order date: ${formatOrderPlacedAt(input.orderDate)}`,
    `Order ID: ${shortId}`,
    input.trackingNumber?.trim() ? `NZ Post tracking: ${input.trackingNumber.trim()}` : "",
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
    `Download / print tax invoice: ${printUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Packing Slip & Tax Invoice — Order #${shortId} (${customerName})`,
    html: renderSupermarketEmailLayout({
      appUrl: input.appUrl,
      content: `${printCta}${document}<div style="clear:both;padding-top:24px;">${printCta}</div>`,
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
  const rendered = renderAdminPackingInvoiceEmail({
    ...input,
    appUrl: supermarketEmailAppUrl(),
  });
  const pdf = await taxInvoicePdfAttachment(input, "admin");
  if (pdf) rendered.attachments = [pdf];
  return sendPlatformEmailSafe({
    to: ADMIN_PACKING_INVOICE_EMAIL,
    brand: "stockup",
    rendered,
  });
}
