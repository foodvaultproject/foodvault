"use server";

import { headers } from "next/headers";
import { getAppMode } from "@/lib/app-mode";
import { createStockupSetupIntent, saveStockupSetupIntent } from "@/lib/commerce/stockup-billing";
import type { StockupCardSummary } from "@/lib/commerce/stockup-billing";
import { getPaymentServiceConfig, isValidStripePublishableKey } from "@/lib/payment-service/config";
import { createClient } from "@/lib/supabase/server";

async function signedInStockupUser() {
  const headerStore = await headers();
  if (getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) !== "stockup") {
    return { error: "Auto-Restock is only available on StockUp" as const, user: null };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Sign in to save a card" as const, user: null };
  return { error: null, user };
}

export async function beginStockupCardSetup(): Promise<{
  clientSecret?: string;
  publishableKey?: string;
  error?: string;
}> {
  const { error, user } = await signedInStockupUser();
  if (error || !user?.email) return { error: error ?? "Sign in to save a card" };

  const { isConfigured, publishableKey } = getPaymentServiceConfig();
  if (!isConfigured || !isValidStripePublishableKey(publishableKey)) {
    return { error: "Card payments are not configured" };
  }

  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  try {
    const setup = await createStockupSetupIntent({
      userId: user.id,
      email: user.email,
      name,
    });
    return { clientSecret: setup.clientSecret, publishableKey };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unable to start card setup";
    return { error: message };
  }
}

export async function confirmStockupCard(setupIntentId: string): Promise<{
  card?: StockupCardSummary;
  error?: string;
}> {
  const { error, user } = await signedInStockupUser();
  if (error || !user) return { error: error ?? "Sign in to save a card" };
  if (!setupIntentId.startsWith("seti_")) return { error: "Invalid card setup" };
  try {
    const card = await saveStockupSetupIntent({ userId: user.id, setupIntentId });
    return { card };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unable to save the card";
    return { error: message };
  }
}
