import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { getStripeClient, toStripeAmount } from "@/lib/payment-service/providers/stripe-client";
import type {
  PartnerChargeInput,
  PayoutAccountCreateInput,
  PayoutTransferInput,
} from "@/lib/payment-service/types";

export async function createStripeConnectAccount(input: PayoutAccountCreateInput) {
  const stripe = getStripeClient();
  const countryCode = mapCountryToIso(input.country);

  const account = await stripe.accounts.create({
    type: "express",
    country: countryCode,
    email: input.email,
    business_type: "individual",
    individual: {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
    },
    capabilities: {
      transfers: { requested: true },
    },
    metadata: {
      affiliate_id: input.affiliateId,
      foodvault: "true",
    },
  });

  return account;
}

export async function createStripeConnectOnboardingLink(accountId: string) {
  const stripe = getStripeClient();
  const { appUrl } = getPaymentServiceConfig();

  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl.replace(/\/$/, "")}/affiliate/dashboard?tab=settings&connect=refresh`,
    return_url: `${appUrl.replace(/\/$/, "")}/affiliate/dashboard?tab=settings&connect=return`,
    type: "account_onboarding",
  });
}

export async function retrieveStripeConnectAccount(accountId: string) {
  const stripe = getStripeClient();
  return stripe.accounts.retrieve(accountId);
}

export async function createStripePartnerCustomer(input: {
  partnerId: string;
  email: string;
  businessName: string;
}) {
  const stripe = getStripeClient();
  return stripe.customers.create({
    email: input.email,
    name: input.businessName,
    metadata: {
      partner_id: input.partnerId,
      foodvault: "true",
    },
  });
}

export async function createStripePartnerSetupSession(input: {
  customerId: string;
  partnerId: string;
}) {
  const stripe = getStripeClient();
  const { appUrl } = getPaymentServiceConfig();

  return stripe.checkout.sessions.create({
    mode: "setup",
    customer: input.customerId,
    payment_method_types: ["card"],
    success_url: `${appUrl.replace(/\/$/, "")}/partner/affiliate-program?tab=billing&setup=success`,
    cancel_url: `${appUrl.replace(/\/$/, "")}/partner/affiliate-program?tab=billing&setup=cancelled`,
    metadata: {
      partner_id: input.partnerId,
      foodvault: "true",
    },
  });
}

export async function chargeStripePartnerInvoice(input: PartnerChargeInput) {
  const stripe = getStripeClient();

  return stripe.paymentIntents.create(
    {
      amount: toStripeAmount(input.amount, input.currency),
      currency: input.currency.toLowerCase(),
      customer: input.customerId,
      payment_method: input.paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        invoice_id: input.invoiceId,
        partner_id: input.partnerId,
        foodvault: "true",
      },
    },
    { idempotencyKey: input.idempotencyKey }
  );
}

export async function transferStripePayout(input: PayoutTransferInput) {
  const stripe = getStripeClient();

  return stripe.transfers.create(
    {
      amount: toStripeAmount(input.amount, input.currency),
      currency: input.currency.toLowerCase(),
      destination: input.destinationAccountId,
      metadata: {
        payout_item_id: input.payoutItemId,
        foodvault: "true",
      },
    },
    { idempotencyKey: input.idempotencyKey }
  );
}

function mapCountryToIso(country: string): string {
  const normalized = country.trim().toLowerCase();
  if (normalized === "new zealand" || normalized === "nz") return "NZ";
  if (normalized === "australia" || normalized === "au") return "AU";
  if (normalized === "united states" || normalized === "usa" || normalized === "us") return "US";
  if (normalized === "united kingdom" || normalized === "uk") return "GB";
  return "NZ";
}

export function mapStripeAccountStatus(account: {
  details_submitted?: boolean;
  payouts_enabled?: boolean;
  charges_enabled?: boolean;
  requirements?: { disabled_reason?: string | null };
}) {
  const detailsSubmitted = Boolean(account.details_submitted);
  const payoutsEnabled = Boolean(account.payouts_enabled);

  let onboardingStatus: "pending" | "restricted" | "complete" = "pending";
  if (payoutsEnabled && detailsSubmitted) {
    onboardingStatus = "complete";
  } else if (account.requirements?.disabled_reason) {
    onboardingStatus = "restricted";
  }

  return {
    onboardingStatus,
    payoutsEnabled,
    chargesEnabled: Boolean(account.charges_enabled),
    detailsSubmitted,
  };
}
