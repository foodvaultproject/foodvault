import { createHmac, timingSafeEqual } from "crypto";

function invoiceSigningSecret() {
  return (
    process.env.CRON_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    ""
  );
}

export function createStockUpInvoiceToken(orderId: string) {
  const secret = invoiceSigningSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(`stockup-invoice:${orderId}`).digest("hex");
}

export function verifyStockUpInvoiceToken(orderId: string, token: string | null | undefined) {
  const expected = createStockUpInvoiceToken(orderId);
  const provided = token?.trim() ?? "";
  if (!expected || !provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function customerTaxInvoicePrintUrl(input: {
  appUrl: string;
  orderId: string;
  isMember: boolean;
}) {
  const site = input.appUrl.replace(/\/$/, "");
  if (input.isMember) {
    return `${site}/account/history/${input.orderId}?autoprint=1`;
  }
  const token = createStockUpInvoiceToken(input.orderId);
  const query = new URLSearchParams({ autoprint: "1" });
  if (token) query.set("token", token);
  return `${site}/invoice/${input.orderId}?${query.toString()}`;
}
