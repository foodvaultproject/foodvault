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
    isConfigured: Boolean(secretKey),
  };
}

export const DEFAULT_PAYOUT_CURRENCY = "NZD";
