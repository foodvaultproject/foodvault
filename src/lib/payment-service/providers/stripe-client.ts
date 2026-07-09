import Stripe from "stripe";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  const { secretKey, isConfigured } = getPaymentServiceConfig();
  if (!isConfigured) {
    throw new Error("Stripe is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function toStripeAmount(amount: number, currency: string): number {
  const zeroDecimal = ["jpy", "krw"].includes(currency.toLowerCase());
  return zeroDecimal ? Math.round(amount) : Math.round(amount * 100);
}
