import { canonicalSiteOrigin } from "@/lib/app-mode";

function looksLikePlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  return (
    normalized.includes("your_") ||
    normalized.includes("placeholder") ||
    normalized.endsWith("...") ||
    normalized.includes("changeme")
  );
}

/** Trim, drop wrapping quotes, and remove accidental whitespace from a pasted key. */
export function normalizeStripeKey(value: string) {
  let trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed.replace(/\s+/g, "");
}

export function isValidStripeSecretKey(key: string): boolean {
  const trimmed = normalizeStripeKey(key);
  if (looksLikePlaceholder(trimmed)) return false;
  return /^(sk|rk)_(test|live)_[A-Za-z0-9]+$/.test(trimmed);
}

export function isValidStripePublishableKey(key: string): boolean {
  const trimmed = normalizeStripeKey(key);
  if (looksLikePlaceholder(trimmed)) return false;
  return /^pk_(test|live)_[A-Za-z0-9]+$/.test(trimmed);
}

/** Checkout return origin for the request that started payment, then the deployment site URL. */
export function resolvePaymentReturnOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = (forwardedHost ?? request.headers.get("host") ?? "").split(",")[0]?.trim() ?? "";
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    forwardedProto ||
    (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");

  if (host) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  return (process.env.NEXT_PUBLIC_SITE_URL ?? canonicalSiteOrigin()).replace(/\/$/, "");
}

export function getPaymentServiceConfig() {
  const secretKey = normalizeStripeKey(process.env.STRIPE_SECRET_KEY ?? "");
  const webhookSecret = normalizeStripeKey(process.env.STRIPE_WEBHOOK_SECRET ?? "");
  const publishableKey = normalizeStripeKey(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
  );
  const appUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? canonicalSiteOrigin()).replace(/\/$/, "");

  return {
    secretKey,
    webhookSecret,
    publishableKey,
    appUrl,
    isConfigured: isValidStripeSecretKey(secretKey),
  };
}

export const DEFAULT_PAYOUT_CURRENCY = "NZD";
