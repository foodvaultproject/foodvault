import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/payment-service/providers/stripe-client";

export type StockupCardSummary = {
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
};

export async function getStockupBillingCustomerId(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin || !userId) return null;
  const { data } = await admin
    .from("stockup_billing_profiles")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  const id = typeof data?.stripe_customer_id === "string" ? data.stripe_customer_id.trim() : "";
  return id || null;
}

export async function getStockupCardSummary(userId: string): Promise<StockupCardSummary | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("stockup_billing_profiles")
    .select("card_brand, card_last4, card_exp_month, card_exp_year, default_payment_method_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data?.default_payment_method_id) return null;
  return {
    brand: data.card_brand ?? null,
    last4: data.card_last4 ?? null,
    expMonth: data.card_exp_month ?? null,
    expYear: data.card_exp_year ?? null,
  };
}

async function upsertBillingCustomer(userId: string, stripeCustomerId: string) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Billing storage is unavailable");
  const now = new Date().toISOString();
  const { error } = await admin.from("stockup_billing_profiles").upsert(
    {
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      updated_at: now,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(error.message);
}

export async function ensureStockupStripeCustomer(input: {
  userId: string;
  email: string;
  name?: string | null;
}): Promise<string> {
  const stripe = getStripeClient();
  const existingId = await getStockupBillingCustomerId(input.userId);
  if (existingId) {
    try {
      const customer = await stripe.customers.retrieve(existingId);
      if (!("deleted" in customer && customer.deleted)) return existingId;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!/no such customer|resource_missing/i.test(message)) throw error;
    }
  }

  const customer = await stripe.customers.create({
    email: input.email,
    name: input.name?.trim() || undefined,
    metadata: { stockup: "billing", user_id: input.userId },
  });
  await upsertBillingCustomer(input.userId, customer.id);
  return customer.id;
}

export async function createStockupSetupIntent(input: {
  userId: string;
  email: string;
  name?: string | null;
}): Promise<{ clientSecret: string }> {
  const customerId = await ensureStockupStripeCustomer(input);
  const intent = await getStripeClient().setupIntents.create({
    customer: customerId,
    usage: "off_session",
    payment_method_types: ["card"],
    metadata: { stockup: "billing", user_id: input.userId },
  });
  if (!intent.client_secret) throw new Error("Stripe did not return a setup secret");
  return { clientSecret: intent.client_secret };
}

export async function saveStockupSetupIntent(input: {
  userId: string;
  setupIntentId: string;
}): Promise<StockupCardSummary> {
  const stripe = getStripeClient();
  const intent = await stripe.setupIntents.retrieve(input.setupIntentId, {
    expand: ["payment_method"],
  });
  if (intent.metadata?.user_id !== input.userId || intent.metadata?.stockup !== "billing") {
    throw new Error("This card setup does not belong to the signed-in shopper");
  }
  if (intent.status !== "succeeded") {
    throw new Error("The card was not saved");
  }

  const paymentMethod =
    intent.payment_method && typeof intent.payment_method === "object"
      ? intent.payment_method
      : typeof intent.payment_method === "string"
        ? await stripe.paymentMethods.retrieve(intent.payment_method)
        : null;
  const paymentMethodId = paymentMethod?.id ?? "";
  if (!paymentMethodId) throw new Error("Stripe did not return a payment method");

  const customerId =
    typeof intent.customer === "string" ? intent.customer : intent.customer?.id ?? "";
  if (!customerId) throw new Error("Stripe customer is missing from the card setup");

  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  const card = paymentMethod?.card ?? null;
  const summary: StockupCardSummary = {
    brand: card?.brand ?? paymentMethod?.type ?? null,
    last4: card?.last4 ?? null,
    expMonth: card?.exp_month ?? null,
    expYear: card?.exp_year ?? null,
  };

  const admin = createAdminClient();
  if (!admin) throw new Error("Billing storage is unavailable");
  const { error } = await admin.from("stockup_billing_profiles").upsert(
    {
      user_id: input.userId,
      stripe_customer_id: customerId,
      default_payment_method_id: paymentMethodId,
      card_brand: summary.brand,
      card_last4: summary.last4,
      card_exp_month: summary.expMonth,
      card_exp_year: summary.expYear,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(error.message);
  return summary;
}
