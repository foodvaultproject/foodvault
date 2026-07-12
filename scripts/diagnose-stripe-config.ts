/**
 * Check Stripe env vars used for member checkout (does not print secret values).
 *
 * Run from project root:
 *   npm run diagnose:stripe
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  getPaymentServiceConfig,
  isValidStripePublishableKey,
  isValidStripeSecretKey,
} from "../src/lib/payment-service/config";
import {
  getMemberPriceId,
  getMemberProductId,
} from "../src/lib/payment-service/providers/stripe-member";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.warn("No .env.local found — using process.env only.");
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function mask(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "(empty)";
  if (trimmed.length <= 12) return `${trimmed.slice(0, 4)}…`;
  return `${trimmed.slice(0, 8)}…${trimmed.slice(-4)}`;
}

function status(ok: boolean): string {
  return ok ? "OK" : "INVALID / PLACEHOLDER";
}

loadEnvLocal();

const { secretKey, publishableKey, webhookSecret, appUrl, isConfigured } =
  getPaymentServiceConfig();
const priceId = getMemberPriceId();
const productId = getMemberProductId();

console.log("\n=== FoodVault Stripe config diagnostic ===\n");
console.log(`STRIPE_SECRET_KEY:              ${status(isValidStripeSecretKey(secretKey))}  ${mask(secretKey)}`);
console.log(
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${status(isValidStripePublishableKey(publishableKey))}  ${mask(publishableKey)}`
);
console.log(`STRIPE_WEBHOOK_SECRET:          ${webhookSecret.trim() ? "set" : "missing"}  ${mask(webhookSecret)}`);
console.log(`STRIPE_MEMBER_PRICE_ID:         ${priceId.trim() ? "set" : "missing"}  ${mask(priceId)}`);
console.log(`STRIPE_PRICE_ID (fallback):     ${(process.env.STRIPE_PRICE_ID ?? "").trim() ? "set" : "missing"}`);
console.log(`STRIPE_MEMBER_PRODUCT_ID:       ${productId.trim() ? "set" : "optional"}`);
console.log(`NEXT_PUBLIC_SITE_URL:           ${appUrl}`);
console.log(`Checkout ready:                 ${isConfigured && (priceId || productId) ? "yes" : "no"}`);

if (!isValidStripeSecretKey(secretKey)) {
  console.log(
    "\nFix: In Vercel → Project → Settings → Environment Variables, replace STRIPE_SECRET_KEY"
  );
  console.log("with the real sk_test_… or sk_live_… value from your .env.local (not your_str… placeholders).");
}

if (!priceId && !productId) {
  console.log(
    "\nFix: Set STRIPE_MEMBER_PRICE_ID (or STRIPE_PRICE_ID) to your Stripe price id, e.g. price_…"
  );
}

console.log("");
