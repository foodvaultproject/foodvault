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

export function isValidStripeSecretKey(key: string): boolean {
  const trimmed = key.trim();
  if (looksLikePlaceholder(trimmed)) return false;
  return /^sk_(test|live)_[A-Za-z0-9]+$/.test(trimmed);
}

export function isValidStripePublishableKey(key: string): boolean {
  const trimmed = key.trim();
  if (looksLikePlaceholder(trimmed)) return false;
  return /^pk_(test|live)_[A-Za-z0-9]+$/.test(trimmed);
}

export function getPaymentServiceConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    secretKey,
    webhookSecret,
    publishableKey,
    appUrl,
    isConfigured: isValidStripeSecretKey(secretKey),
  };
}

export const DEFAULT_PAYOUT_CURRENCY = "NZD";
