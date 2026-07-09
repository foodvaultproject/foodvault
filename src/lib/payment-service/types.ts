export type PaymentProvider = "stripe" | "stripe_connect" | "wise" | "airwallex" | "paypal" | "bank_transfer";

export type PayoutOnboardingStatus = "pending" | "restricted" | "complete";

export type AffiliatePayoutAccount = {
  connected: boolean;
  provider?: PaymentProvider;
  onboardingStatus?: PayoutOnboardingStatus;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  defaultCurrency?: string;
  updatedAt?: string;
};

export type PartnerBillingProfile = {
  configured: boolean;
  provider?: PaymentProvider;
  billingStatus?: "none" | "active" | "past_due" | "disabled";
  hasPaymentMethod?: boolean;
  updatedAt?: string;
};

export type PayoutHistoryItem = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  periodStart: string;
  periodEnd: string;
};

export type PayoutAccountCreateInput = {
  affiliateId: string;
  email: string;
  country: string;
  firstName: string;
  lastName: string;
};

export type PayoutTransferInput = {
  payoutItemId: string;
  amount: number;
  currency: string;
  destinationAccountId: string;
  idempotencyKey: string;
};

export type PartnerChargeInput = {
  invoiceId: string;
  partnerId: string;
  amount: number;
  currency: string;
  customerId: string;
  paymentMethodId: string;
  idempotencyKey: string;
};
