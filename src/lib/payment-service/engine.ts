import { createAdminClient } from "@/lib/supabase/admin";
import {
  chargeStripePartnerInvoice,
  createStripeConnectAccount,
  createStripeConnectOnboardingLink,
  createStripePartnerCustomer,
  createStripePartnerSetupSession,
  mapStripeAccountStatus,
  retrieveStripeConnectAccount,
  transferStripePayout,
} from "@/lib/payment-service/providers/stripe-connect";
import { queueNotification } from "@/lib/notification-service/engine";
import type {
  PartnerChargeInput,
  PayoutAccountCreateInput,
  PayoutTransferInput,
} from "@/lib/payment-service/types";

export async function ensureAffiliatePayoutAccount(input: PayoutAccountCreateInput) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client unavailable");

  const { data: existing } = await admin
    .from("payout_accounts")
    .select("external_account_id")
    .eq("affiliate_id", input.affiliateId)
    .maybeSingle();

  let accountId = existing?.external_account_id as string | undefined;

  if (!accountId) {
    const account = await createStripeConnectAccount(input);
    accountId = account.id;

    const status = mapStripeAccountStatus(account);
    await admin.rpc("upsert_payout_account", {
      p_affiliate_id: input.affiliateId,
      p_provider: "stripe_connect",
      p_external_account_id: accountId,
      p_onboarding_status: status.onboardingStatus,
      p_payouts_enabled: status.payoutsEnabled,
      p_charges_enabled: status.chargesEnabled,
      p_details_submitted: status.detailsSubmitted,
      p_default_currency: account.default_currency?.toUpperCase() ?? "NZD",
    });
  }

  const link = await createStripeConnectOnboardingLink(accountId);
  return { accountId, url: link.url };
}

export async function refreshAffiliatePayoutAccount(affiliateId: string, accountId: string) {
  const account = await retrieveStripeConnectAccount(accountId);
  const status = mapStripeAccountStatus(account);

  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client unavailable");

  await admin.rpc("upsert_payout_account", {
    p_affiliate_id: affiliateId,
    p_provider: "stripe_connect",
    p_external_account_id: accountId,
    p_onboarding_status: status.onboardingStatus,
    p_payouts_enabled: status.payoutsEnabled,
    p_charges_enabled: status.chargesEnabled,
    p_details_submitted: status.detailsSubmitted,
    p_default_currency: account.default_currency?.toUpperCase() ?? "NZD",
  });

  return status;
}

export async function syncStripeConnectAccountFromWebhook(accountId: string) {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: row } = await admin
    .from("payout_accounts")
    .select("affiliate_id")
    .eq("external_account_id", accountId)
    .maybeSingle();

  if (!row?.affiliate_id) return;

  await refreshAffiliatePayoutAccount(String(row.affiliate_id), accountId);
}

export async function ensurePartnerBillingSetup(input: {
  partnerId: string;
  email: string;
  businessName: string;
}) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client unavailable");

  const { data: existing } = await admin
    .from("partner_billing_profiles")
    .select("external_customer_id")
    .eq("partner_id", input.partnerId)
    .maybeSingle();

  let customerId = existing?.external_customer_id as string | undefined;

  if (!customerId) {
    const customer = await createStripePartnerCustomer(input);
    customerId = customer.id;

    await admin.rpc("upsert_partner_billing_profile", {
      p_partner_id: input.partnerId,
      p_provider: "stripe",
      p_external_customer_id: customerId,
      p_default_payment_method_id: null,
      p_billing_status: "none",
    });
  }

  const session = await createStripePartnerSetupSession({
    customerId,
    partnerId: input.partnerId,
  });

  return { customerId, url: session.url };
}

export async function completePartnerBillingSetup(input: {
  partnerId: string;
  customerId: string;
  paymentMethodId: string;
}) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client unavailable");

  await admin.rpc("upsert_partner_billing_profile", {
    p_partner_id: input.partnerId,
    p_provider: "stripe",
    p_external_customer_id: input.customerId,
    p_default_payment_method_id: input.paymentMethodId,
    p_billing_status: "active",
  });
}

export async function processPartnerInvoiceCharge(input: PartnerChargeInput) {
  const intent = await chargeStripePartnerInvoice(input);
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client unavailable");

  if (intent.status === "succeeded") {
    await admin.rpc("mark_billing_invoice_status", {
      p_invoice_id: input.invoiceId,
      p_status: "paid",
      p_external_payment_intent_id: intent.id,
      p_failure_message: null,
    });
    await queueNotification({
      eventType: "PAYMENT_SUCCESS",
      partnerId: input.partnerId,
      payload: { invoice_id: input.invoiceId, amount: input.amount, currency: input.currency },
    });
  } else {
    await admin.rpc("mark_billing_invoice_status", {
      p_invoice_id: input.invoiceId,
      p_status: "failed",
      p_external_payment_intent_id: intent.id,
      p_failure_message: intent.last_payment_error?.message ?? "Payment failed",
    });
    await queueNotification({
      eventType: "PAYMENT_FAILED",
      partnerId: input.partnerId,
      payload: {
        invoice_id: input.invoiceId,
        amount: input.amount,
        currency: input.currency,
        message: intent.last_payment_error?.message ?? "Payment failed",
      },
    });
  }

  return intent;
}

export async function processAffiliatePayoutTransfer(input: PayoutTransferInput) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client unavailable");

  await admin.rpc("mark_payout_item_status", {
    p_payout_item_id: input.payoutItemId,
    p_status: "processing",
    p_external_transfer_id: null,
    p_external_payout_id: null,
    p_failure_message: null,
  });

  try {
    const transfer = await transferStripePayout(input);
    await admin.rpc("mark_payout_item_status", {
      p_payout_item_id: input.payoutItemId,
      p_status: "paid",
      p_external_transfer_id: transfer.id,
      p_external_payout_id: null,
      p_failure_message: null,
    });

    const { data: payoutItem } = await admin
      .from("payout_items")
      .select("affiliate_id, amount, currency")
      .eq("id", input.payoutItemId)
      .maybeSingle();

    if (payoutItem?.affiliate_id) {
      await queueNotification({
        eventType: "AFFILIATE_PAYMENT_SENT",
        affiliateId: String(payoutItem.affiliate_id),
        payload: {
          amount: Number(payoutItem.amount ?? input.amount),
          currency: String(payoutItem.currency ?? input.currency),
        },
      });
    }

    return transfer;
  } catch (error) {
    await admin.rpc("mark_payout_item_status", {
      p_payout_item_id: input.payoutItemId,
      p_status: "failed",
      p_external_transfer_id: null,
      p_external_payout_id: null,
      p_failure_message: error instanceof Error ? error.message : "Transfer failed",
    });

    const { data: payoutItem } = await admin
      .from("payout_items")
      .select("affiliate_id, amount, currency")
      .eq("id", input.payoutItemId)
      .maybeSingle();

    if (payoutItem?.affiliate_id) {
      await queueNotification({
        eventType: "PAYOUT_FAILED",
        affiliateId: String(payoutItem.affiliate_id),
        payload: {
          amount: Number(payoutItem.amount ?? input.amount),
          currency: String(payoutItem.currency ?? input.currency),
        },
      });
    }

    throw error;
  }
}

export async function processOpenPayoutBatch(batchId: string) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client unavailable");

  const { data: items } = await admin
    .from("payout_items")
    .select("id, affiliate_id, amount, currency, idempotency_key")
    .eq("batch_id", batchId)
    .eq("status", "pending");

  for (const item of items ?? []) {
    const { data: account } = await admin
      .from("payout_accounts")
      .select("external_account_id, payouts_enabled, onboarding_status")
      .eq("affiliate_id", item.affiliate_id)
      .maybeSingle();

    if (
      !account?.external_account_id ||
      !account.payouts_enabled ||
      account.onboarding_status !== "complete"
    ) {
      continue;
    }

    await processAffiliatePayoutTransfer({
      payoutItemId: String(item.id),
      amount: Number(item.amount),
      currency: String(item.currency ?? "NZD"),
      destinationAccountId: String(account.external_account_id),
      idempotencyKey: String(item.idempotency_key),
    });
  }

  await admin
    .from("payout_batches")
    .update({ status: "completed", processed_at: new Date().toISOString() })
    .eq("id", batchId);
}

export async function processOpenPartnerInvoices() {
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client unavailable");

  const { data: invoices } = await admin
    .from("billing_invoices")
    .select("id, partner_id, gross_commission, currency, idempotency_key")
    .eq("status", "open");

  for (const invoice of invoices ?? []) {
    const { data: profile } = await admin
      .from("partner_billing_profiles")
      .select("external_customer_id, default_payment_method_id, billing_status")
      .eq("partner_id", invoice.partner_id)
      .maybeSingle();

    if (
      !profile?.external_customer_id ||
      !profile.default_payment_method_id ||
      profile.billing_status !== "active"
    ) {
      continue;
    }

    await processPartnerInvoiceCharge({
      invoiceId: String(invoice.id),
      partnerId: String(invoice.partner_id),
      amount: Number(invoice.gross_commission),
      currency: String(invoice.currency ?? "NZD"),
      customerId: String(profile.external_customer_id),
      paymentMethodId: String(profile.default_payment_method_id),
      idempotencyKey: `charge-${invoice.idempotency_key}`,
    });
  }
}
