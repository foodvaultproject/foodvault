import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { shortOrderId } from "@/lib/admin/picker-shared";
import { formatOrderPlacedAt } from "@/lib/commerce/order-display";
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

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const INK = rgb(0.07, 0.09, 0.15);
const MUTED = rgb(0.35, 0.39, 0.45);
const RULE = rgb(0.07, 0.09, 0.15);
const LIGHT = rgb(0.82, 0.84, 0.86);

export type TaxInvoicePdfVariant = "admin" | "customer";

function gstIncluded(total: number) {
  return Math.round(((total * 3) / 23) * 100) / 100;
}

function pdfSafe(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number) {
  const safe = pdfSafe(text) || "—";
  const words = safe.split(" ");
  const lines: string[] = [];
  let current = "";

  const pushChunk = (chunk: string) => {
    if (font.widthOfTextAtSize(chunk, size) <= maxWidth) {
      lines.push(chunk);
      return;
    }
    let part = "";
    for (const char of chunk) {
      const next = part + char;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        part = next;
      } else {
        if (part) lines.push(part);
        part = char;
      }
    }
    if (part) lines.push(part);
  };

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = "";
      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        current = word;
      } else {
        pushChunk(word);
      }
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["—"];
}

type Column = { key: string; label: string; width: number; align: "left" | "center" | "right" };

function columnsFor(variant: TaxInvoicePdfVariant): Column[] {
  if (variant === "admin") {
    return [
      { key: "name", label: "Product", width: 178, align: "left" },
      { key: "sku", label: "SKU", width: 72, align: "left" },
      { key: "ordered", label: "Qty ordered", width: 62, align: "center" },
      { key: "picked", label: "Qty supplied", width: 64, align: "center" },
      { key: "unit", label: "Unit price", width: 70, align: "right" },
      { key: "total", label: "Line total", width: 65, align: "right" },
    ];
  }
  return [
    { key: "name", label: "Product", width: 250, align: "left" },
    { key: "picked", label: "Qty supplied", width: 80, align: "center" },
    { key: "unit", label: "Unit price", width: 90, align: "right" },
    { key: "total", label: "Line total", width: 91, align: "right" },
  ];
}

function cellValue(line: TaxInvoiceLine, key: string) {
  if (key === "name") return line.name;
  if (key === "sku") return line.sku?.trim() || "—";
  if (key === "ordered") return String(line.ordered);
  if (key === "picked") return String(line.picked);
  if (key === "unit") return formatNzPrice(line.unitPrice);
  return formatNzPrice(line.lineTotal);
}

export async function generateTaxInvoicePdf(
  order: TaxInvoiceInput,
  variant: TaxInvoicePdfVariant = "customer"
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const columns = columnsFor(variant);
  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
  const shortId = shortOrderId(order.orderId);
  const title = variant === "admin" ? "TAX INVOICE / PACKING SLIP" : "TAX INVOICE";
  const gst = gstIncluded(order.capturedTotal);
  const customerName = pdfSafe(order.customerName?.trim() || "Customer");

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed >= MARGIN + 24) return;
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    drawTableHeader(page, bold, columns, tableWidth, y);
    y -= 22;
  };

  const drawText = (
    target: PDFPage,
    text: string,
    x: number,
    top: number,
    size: number,
    face: PDFFont,
    color = INK
  ) => {
    target.drawText(pdfSafe(text), { x, y: top - size, size, font: face, color });
  };

  drawText(page, title, MARGIN, y, 18, bold);
  y -= 28;
  drawText(page, "Britomart Groceries Limited t/a StockUp", MARGIN, y, 11, bold);
  y -= 15;
  drawText(page, "17 Galway Street, Auckland Central, Auckland, 1010, NZ", MARGIN, y, 10, font);
  y -= 14;
  drawText(page, "GST No: 140-493-740", MARGIN, y, 10, font);
  y -= 22;

  const leftX = MARGIN;
  const rightX = PAGE_WIDTH / 2 + 8;
  const startY = y;
  drawText(page, "BILL / DELIVER TO", leftX, y, 8, bold, MUTED);
  y -= 14;
  drawText(page, customerName, leftX, y, 10, bold);
  y -= 13;
  if (order.customerEmail?.trim()) {
    drawText(page, order.customerEmail.trim(), leftX, y, 10, font);
    y -= 13;
  }
  if (order.customerPhone?.trim()) {
    drawText(page, order.customerPhone.trim(), leftX, y, 10, font);
    y -= 13;
  }
  const address = order.addressLines.filter(Boolean);
  if (address.length === 0) {
    drawText(page, "No shipping address on file.", leftX, y, 10, font);
    y -= 13;
  } else {
    for (const line of address) {
      const wrapped = wrapText(font, line, 10, rightX - leftX - 12);
      for (const part of wrapped) {
        drawText(page, part, leftX, y, 10, font);
        y -= 13;
      }
    }
  }
  const leftBottom = y;

  y = startY;
  drawText(page, "ORDER", rightX, y, 8, bold, MUTED);
  y -= 14;
  drawText(page, `Order ID: ${shortId}`, rightX, y, 10, font);
  y -= 13;
  drawText(page, `Order date: ${formatOrderPlacedAt(order.orderDate)}`, rightX, y, 10, font);
  y -= 13;
  const tracking = order.trackingNumber?.trim();
  drawText(
    page,
    tracking ? `NZ Post tracking: ${tracking}` : "NZ Post tracking: —",
    rightX,
    y,
    10,
    font
  );
  y -= 13;
  y = Math.min(leftBottom, y) - 10;

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1.5,
    color: RULE,
  });
  y -= 18;

  drawTableHeader(page, bold, columns, tableWidth, y);
  y -= 20;

  for (const line of order.lines) {
    const wrappedName = wrapText(font, line.name, 9, columns[0].width - 6);
    const rowHeight = Math.max(16, wrappedName.length * 12);
    ensureSpace(rowHeight + 4);

    let x = MARGIN;
    for (const col of columns) {
      const value = col.key === "name" ? wrappedName[0] : cellValue(line, col.key);
      const size = 9;
      const text = pdfSafe(value);
      const textWidth = font.widthOfTextAtSize(text, size);
      let textX = x + 3;
      if (col.align === "right") textX = x + col.width - 4 - textWidth;
      if (col.align === "center") textX = x + (col.width - textWidth) / 2;
      page.drawText(text, { x: textX, y: y - 11, size, font, color: INK });
      x += col.width;
    }
    if (wrappedName.length > 1) {
      for (let i = 1; i < wrappedName.length; i += 1) {
        page.drawText(pdfSafe(wrappedName[i]), {
          x: MARGIN + 3,
          y: y - 11 - i * 12,
          size: 9,
          font,
          color: INK,
        });
      }
    }
    y -= rowHeight;
    page.drawLine({
      start: { x: MARGIN, y: y + 2 },
      end: { x: MARGIN + tableWidth, y: y + 2 },
      thickness: 0.4,
      color: LIGHT,
    });
  }

  ensureSpace(88);
  y -= 10;
  const totalsX = PAGE_WIDTH - MARGIN - 220;
  const drawTotal = (label: string, value: string, size: number, face: PDFFont, gap: number) => {
    page.drawText(pdfSafe(label), { x: totalsX, y: y - size, size, font: face, color: INK });
    const width = face.widthOfTextAtSize(pdfSafe(value), size);
    page.drawText(pdfSafe(value), {
      x: PAGE_WIDTH - MARGIN - width,
      y: y - size,
      size,
      font: face,
      color: INK,
    });
    y -= gap;
  };

  drawTotal("Subtotal", formatNzPrice(order.subtotal), 10, font, 16);
  drawTotal(
    "Freight",
    order.shippingCost === 0 ? "FREE" : formatNzPrice(order.shippingCost),
    10,
    font,
    16
  );
  page.drawLine({
    start: { x: totalsX, y: y + 4 },
    end: { x: PAGE_WIDTH - MARGIN, y: y + 4 },
    thickness: 1.2,
    color: RULE,
  });
  y -= 4;
  drawTotal("Total Charged", formatNzPrice(order.capturedTotal), 12, bold, 18);
  drawTotal("Includes GST (15%)", formatNzPrice(gst), 10, font, 16);

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

function drawTableHeader(
  page: PDFPage,
  bold: PDFFont,
  columns: Column[],
  tableWidth: number,
  y: number
) {
  page.drawLine({
    start: { x: MARGIN, y: y + 4 },
    end: { x: MARGIN + tableWidth, y: y + 4 },
    thickness: 1,
    color: RULE,
  });
  let x = MARGIN;
  for (const col of columns) {
    const size = 8;
    const label = pdfSafe(col.label.toUpperCase());
    const width = bold.widthOfTextAtSize(label, size);
    let textX = x + 3;
    if (col.align === "right") textX = x + col.width - 4 - width;
    if (col.align === "center") textX = x + (col.width - width) / 2;
    page.drawText(label, { x: textX, y: y - 10, size, font: bold, color: MUTED });
    x += col.width;
  }
  page.drawLine({
    start: { x: MARGIN, y: y - 16 },
    end: { x: MARGIN + tableWidth, y: y - 16 },
    thickness: 1,
    color: RULE,
  });
}
