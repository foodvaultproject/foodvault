import { sendMemberMembershipActivatedEmail } from "@/lib/email-templates/dispatch";
import type Stripe from "stripe";
import { SIGNUP_PAYMENT_PATH, SIGNUP_WELCOME_PATH } from "@/lib/member/paths";
import {
  memberRowHasPaidSubscription,
  resolveMemberBillingRow,
} from "@/lib/member/member-record";
import { getMembershipSettings } from "@/lib/member/settings";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import { getStripeClient } from "@/lib/payment-service/providers/stripe-client";
import { syncMemberProfileFromAuth } from "@/lib/member/upsert-signup-profile";
import { createAdminClient } from "@/lib/supabase/admin";

type CreateMemberCheckoutSessionInput = {
  authUserId: string;
  email: string;
  stripeCustomerId?: string | null;
};

export function getMemberPriceId(): string {
  return process.env.STRIPE_MEMBER_PRICE_ID ?? process.env.STRIPE_PRICE_ID ?? "";
}

export function getMemberProductId(): string {
  return process.env.STRIPE_MEMBER_PRODUCT_ID ?? "";
}

async function buildMemberCheckoutLineItem(
  membershipPriceMonthly: number
): Promise<Stripe.Checkout.SessionCreateParams.LineItem> {
  const stripe = getStripeClient();
  const productId = getMemberProductId();
  const configuredPriceId = getMemberPriceId();

  if (productId) {
    return {
      price_data: {
        currency: "nzd",
        product: productId,
        unit_amount: Math.round(membershipPriceMonthly * 100),
        recurring: { interval: "month" },
      },
      quantity: 1,
    };
  }

  if (configuredPriceId) {
    const configuredPrice = await stripe.prices.retrieve(configuredPriceId);
    const resolvedProductId =
      typeof configuredPrice.product === "string"
        ? configuredPrice.product
        : configuredPrice.product.id;

    return {
      price_data: {
        currency: configuredPrice.currency,
        product: resolvedProductId,
        unit_amount: Math.round(membershipPriceMonthly * 100),
        recurring: { interval: "month" },
      },
      quantity: 1,
    };
  }

  throw new Error("Member subscription price is not configured");
}

export async function createMemberCheckoutSession(
  input: CreateMemberCheckoutSessionInput
) {
  if (await memberAlreadyHasPaidSubscription(input.authUserId)) {
    throw new Error("You already have an active FoodVault membership.");
  }

  const { membershipPriceMonthly } = await getMembershipSettings();
  const lineItem = await buildMemberCheckoutLineItem(membershipPriceMonthly);

  const stripe = getStripeClient();
  const { appUrl } = getPaymentServiceConfig();
  const baseUrl = appUrl.replace(/\/$/, "");

  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [lineItem],
    success_url: `${baseUrl}${SIGNUP_WELCOME_PATH}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}${SIGNUP_PAYMENT_PATH}?cancelled=1`,
    client_reference_id: input.authUserId,
    ...(input.stripeCustomerId
      ? { customer: input.stripeCustomerId }
      : { customer_email: input.email }),
    metadata: {
      foodvault: "member",
      auth_user_id: input.authUserId,
    },
    subscription_data: {
      metadata: {
        foodvault: "member",
        auth_user_id: input.authUserId,
      },
    },
  });
}

export type CancelMemberSubscriptionResult = {
  status: "scheduled" | "already_scheduled" | "already_canceled";
  accessUntil: string | null;
};

/**
 * Cancel a member's Stripe subscription at period end (source of truth).
 * FoodVault access stays active until Stripe ends the subscription and the
 * webhook/sync path revokes it.
 */
export async function cancelMemberStripeSubscription(
  authUserId: string
): Promise<CancelMemberSubscriptionResult> {
  if (!getPaymentServiceConfig().isConfigured) {
    throw new Error("Stripe is not configured");
  }

  const admin = createAdminClient();
  if (!admin) {
    throw new Error(
      "Admin Supabase client unavailable — set SUPABASE_SERVICE_ROLE_KEY to cancel memberships"
    );
  }

  const member = await resolveMemberBillingRow(admin, authUserId);
  const subscriptionId = member?.stripe_subscription_id?.trim();

  if (!subscriptionId) {
    throw new Error(
      "No active Stripe subscription was found for this account. If you manage billing in the customer portal, cancel there instead."
    );
  }

  const stripe = getStripeClient();
  let subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (subscription.status === "canceled") {
    await syncMemberSubscriptionState(subscription);
    return { status: "already_canceled", accessUntil: null };
  }

  if (subscription.cancel_at_period_end) {
    await syncMemberSubscriptionState(subscription);
    return {
      status: "already_scheduled",
      accessUntil: subscriptionRenewalDate(subscription),
    };
  }

  subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  // Keep FoodVault access aligned with Stripe: still active until period end.
  await syncMemberSubscriptionState(subscription);

  return {
    status: "scheduled",
    accessUntil: subscriptionRenewalDate(subscription),
  };
}

/**
 * Immediately cancel a Stripe subscription (e.g. account deletion).
 * Database revocation follows via sync / webhooks.
 */
export async function cancelMemberStripeSubscriptionImmediately(
  authUserId: string
): Promise<void> {
  if (!getPaymentServiceConfig().isConfigured) {
    return;
  }

  const admin = createAdminClient();
  if (!admin) {
    return;
  }

  const member = await resolveMemberBillingRow(admin, authUserId);
  const subscriptionId = member?.stripe_subscription_id?.trim();
  if (!subscriptionId) {
    return;
  }

  const stripe = getStripeClient();
  const existing = await stripe.subscriptions.retrieve(subscriptionId);
  if (existing.status === "canceled") {
    await syncMemberSubscriptionState(existing);
    return;
  }

  const canceled = await stripe.subscriptions.cancel(subscriptionId);
  await syncMemberSubscriptionState(canceled);
}

/**
 * Creates a Stripe Billing Portal session for an existing customer.
 * The portal handles payment-method updates, invoices/billing history,
 * receipts and (when enabled) cancellation — so no bespoke pages are needed.
 */
export async function createMemberBillingPortalSession(stripeCustomerId: string) {
  const stripe = getStripeClient();
  const { appUrl } = getPaymentServiceConfig();
  const baseUrl = appUrl.replace(/\/$/, "");

  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${baseUrl}/membership`,
  });
}

function formatStripeUnknownError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || error.name;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    const shaped = error as {
      message?: unknown;
      type?: unknown;
      code?: unknown;
      statusCode?: unknown;
    };
    const parts = [
      typeof shaped.message === "string" ? shaped.message : null,
      typeof shaped.type === "string" ? shaped.type : null,
      typeof shaped.code === "string" ? shaped.code : null,
      typeof shaped.statusCode === "number" ? String(shaped.statusCode) : null,
    ].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(" · ");
    }
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

async function memberAlreadyHasPaidSubscription(authUserId: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) {
    return false;
  }

  const member = await resolveMemberBillingRow(admin, authUserId);
  return memberRowHasPaidSubscription(member);
}

async function retrieveMemberCheckoutSession(
  stripe: Stripe,
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });
}

function checkoutSessionIsPaid(session: Stripe.Checkout.Session): boolean {
  return session.status === "complete" && session.payment_status === "paid";
}

function checkoutSessionBelongsToMember(
  session: Stripe.Checkout.Session,
  authUserId: string
): boolean {
  return (
    session.metadata?.auth_user_id === authUserId &&
    session.metadata?.foodvault === "member" &&
    session.mode === "subscription"
  );
}

export async function verifyMemberCheckoutSession(
  sessionId: string,
  authUserId: string
) {
  if (await memberAlreadyHasPaidSubscription(authUserId)) {
    return;
  }

  const stripe = getStripeClient();
  let session = await retrieveMemberCheckoutSession(stripe, sessionId);

  if (!checkoutSessionBelongsToMember(session, authUserId)) {
    throw new Error("Invalid checkout session for this account");
  }

  if (!checkoutSessionIsPaid(session)) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 750));
      session = await retrieveMemberCheckoutSession(stripe, sessionId);
      if (checkoutSessionIsPaid(session)) {
        break;
      }
    }
  }

  if (!checkoutSessionIsPaid(session)) {
    throw new Error("Payment has not completed yet");
  }

  await completeMemberSubscriptionFromCheckout(session);
}

/**
 * Best-effort activation after Stripe redirects back from checkout.
 * Tries the explicit session id first, then falls back to Stripe reconciliation.
 */
export async function activateMemberAfterCheckout(
  authUserId: string,
  email: string,
  sessionId?: string | null
): Promise<boolean> {
  if (!getPaymentServiceConfig().isConfigured) {
    return false;
  }

  if (await memberAlreadyHasPaidSubscription(authUserId)) {
    return true;
  }

  if (sessionId) {
    try {
      await verifyMemberCheckoutSession(sessionId, authUserId);
      return true;
    } catch (error) {
      console.warn("[stripe-member] Direct checkout verification failed; trying reconcile", {
        sessionId,
        authUserId,
        error: formatStripeUnknownError(error),
      });
    }
  }

  return reconcileMemberSubscription(authUserId, email);
}

function subscriptionRenewalDate(subscription: Stripe.Subscription): string | null {
  const legacyPeriodEnd = (
    subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;
  const periodEnd =
    legacyPeriodEnd ?? subscription.items?.data?.[0]?.current_period_end;

  if (typeof periodEnd !== "number") {
    return null;
  }

  return new Date(periodEnd * 1000).toISOString();
}

async function activatePaidMemberSubscription(params: {
  authUserId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  renewalDate: string;
  /** When set (cancel_at_period_end), access stays active and schedule is recorded atomically. */
  cancellationDate?: string | null;
}) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error(
      "Admin Supabase client unavailable — set SUPABASE_SERVICE_ROLE_KEY to activate memberships"
    );
  }

  // Single Postgres transaction: members + memberships (and optional cancel schedule).
  const { data: newlyActivated, error } = await admin.rpc(
    "activate_member_from_stripe",
    {
      p_auth_user_id: params.authUserId,
      p_stripe_customer_id: params.stripeCustomerId,
      p_stripe_subscription_id: params.stripeSubscriptionId,
      p_renewal_date: params.renewalDate,
      p_cancellation_date: params.cancellationDate ?? null,
    }
  );

  if (error) {
    console.error("[stripe-member] activate_member_from_stripe RPC failed", {
      rpc: "activate_member_from_stripe",
      auth_user_id: params.authUserId,
      stripeCustomerPresent: params.stripeCustomerId ? "Yes" : "No",
      stripeSubscriptionPresent: params.stripeSubscriptionId ? "Yes" : "No",
      renewalDate: params.renewalDate,
      cancellationDate: params.cancellationDate ?? null,
      postgresError: error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw new Error(error.message);
  }

  // Non-membership side effects — outside the DB transaction on purpose.
  await syncMemberProfileFromAuth(params.authUserId);

  if (!newlyActivated) {
    return;
  }

  const { data: member } = await admin
    .from("members")
    .select("email, first_name")
    .or(`auth_user_id.eq.${params.authUserId},id.eq.${params.authUserId}`)
    .maybeSingle();

  if (member?.email) {
    void sendMemberMembershipActivatedEmail({
      to: member.email,
      firstName: member.first_name,
    }).catch((emailError) => {
      console.error("[stripe-member] Failed to send membership activated email", {
        authUserId: params.authUserId,
        error: emailError instanceof Error ? emailError.message : emailError,
      });
    });
  }
}

export async function completeMemberSubscriptionFromCheckout(
  session: Stripe.Checkout.Session
) {
  const authUserId = session.metadata?.auth_user_id;

  if (
    session.mode !== "subscription" ||
    session.metadata?.foodvault !== "member" ||
    !authUserId
  ) {
    throw new Error("Invalid member checkout session metadata");
  }

  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionRef = session.subscription;
  const stripeSubscriptionId =
    typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;

  if (!stripeCustomerId || !stripeSubscriptionId) {
    throw new Error("Missing customer or subscription on checkout session");
  }

  const stripe = getStripeClient();
  const subscription =
    typeof subscriptionRef === "object" && subscriptionRef !== null
      ? subscriptionRef
      : await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const renewalDate = subscriptionRenewalDate(subscription);

  if (!renewalDate) {
    throw new Error("Missing current_period_end on subscription");
  }

  await activatePaidMemberSubscription({
    authUserId,
    stripeCustomerId,
    stripeSubscriptionId,
    renewalDate,
  });
}

async function revokeMemberSubscription(authUserId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error(
      "Admin Supabase client unavailable — set SUPABASE_SERVICE_ROLE_KEY to sync subscription cancellations"
    );
  }

  // Single Postgres transaction: revoke members + memberships together.
  const { error } = await admin.rpc("revoke_member_from_stripe", {
    p_auth_user_id: authUserId,
    p_cancellation_date: new Date().toISOString(),
  });

  if (error) {
    console.error("[stripe-member] revoke_member_from_stripe RPC failed", {
      rpc: "revoke_member_from_stripe",
      auth_user_id: authUserId,
      postgresError: error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw new Error(error.message);
  }
}

async function resolveSubscriptionAuthUserId(
  subscription: Stripe.Subscription
): Promise<string | null> {
  const metadataAuthUserId = subscription.metadata?.auth_user_id;
  if (metadataAuthUserId) {
    return metadataAuthUserId;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) {
    return null;
  }

  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const { data } = await admin
    .from("members")
    .select("auth_user_id, id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data?.auth_user_id ?? data?.id ?? null;
}

/**
 * Idempotently reconciles the FoodVault member record with the current Stripe
 * subscription state. Safe to call repeatedly for the same event (webhook
 * retries) and from multiple event types — it only ever sets deterministic values.
 *
 * Business rules:
 * - active / trialing / past_due  → keep member active (including cancel_at_period_end)
 * - cancel_at_period_end=true with status active → still ACTIVE until period ends
 * - canceled / unpaid / incomplete_expired → revoke paid access (subscription.deleted)
 * - incomplete / paused → no-op (never grants access prematurely)
 */
export async function syncMemberSubscriptionState(
  subscription: Stripe.Subscription
): Promise<void> {
  const foodvaultTag = subscription.metadata?.foodvault;
  if (foodvaultTag && foodvaultTag !== "member") {
    return;
  }

  const authUserId = await resolveSubscriptionAuthUserId(subscription);
  if (!authUserId) {
    console.error("[stripe-member] Unable to resolve member for subscription", {
      subscriptionId: subscription.id,
      status: subscription.status,
    });
    return;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) {
    return;
  }

  const activeStatuses: Stripe.Subscription.Status[] = [
    "active",
    "trialing",
    "past_due",
  ];
  const endedStatuses: Stripe.Subscription.Status[] = [
    "canceled",
    "unpaid",
    "incomplete_expired",
  ];

  if (activeStatuses.includes(subscription.status)) {
    const renewalDate =
      subscriptionRenewalDate(subscription) ??
      new Date(Date.now() + 30 * 86400000).toISOString();

    // One atomic RPC: active access, and if cancel_at_period_end, the schedule too.
    await activatePaidMemberSubscription({
      authUserId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      renewalDate,
      cancellationDate: subscription.cancel_at_period_end
        ? renewalDate
        : null,
    });

    return;
  }

  if (endedStatuses.includes(subscription.status)) {
    await revokeMemberSubscription(authUserId);
  }
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const shaped = invoice as unknown as {
    subscription?: string | { id?: string } | null;
    parent?: {
      subscription_details?: {
        subscription?: string | { id?: string } | null;
      } | null;
    } | null;
  };

  const direct = shaped.subscription;
  if (typeof direct === "string") {
    return direct;
  }
  if (direct && typeof direct === "object" && direct.id) {
    return direct.id;
  }

  const parentSub = shaped.parent?.subscription_details?.subscription;
  if (typeof parentSub === "string") {
    return parentSub;
  }
  if (parentSub && typeof parentSub === "object" && parentSub.id) {
    return parentSub.id;
  }

  return null;
}

/**
 * Renewal confirmation. Re-syncs the member from the live subscription so
 * renewal_date advances and membership stays active.
 */
export async function handleMemberInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
): Promise<void> {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) {
    return;
  }

  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncMemberSubscriptionState(subscription);
}

/**
 * Failed payment. Business rule: the member KEEPS access while Stripe retries.
 * Access is only revoked when Stripe ultimately cancels the subscription
 * (handled by customer.subscription.deleted). We only log here.
 */
export async function handleMemberInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  console.warn(
    "[stripe-member] Invoice payment failed — keeping member active during Stripe retry window",
    {
      invoiceId: invoice.id,
      customer:
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id,
      subscriptionId: getInvoiceSubscriptionId(invoice),
    }
  );
}

async function collectStripeCustomerIds(
  stripe: Stripe,
  email: string,
  stripeCustomerId?: string | null
) {
  const customerIds = new Set<string>();

  if (stripeCustomerId?.trim()) {
    customerIds.add(stripeCustomerId.trim());
  }

  const customers = await stripe.customers.list({ email, limit: 5 });
  for (const customer of customers.data) {
    customerIds.add(customer.id);
  }

  return customerIds;
}

function isCompletedMemberCheckoutSession(
  session: Stripe.Checkout.Session,
  authUserId: string
) {
  return (
    session.metadata?.auth_user_id === authUserId &&
    session.metadata?.foodvault === "member" &&
    session.mode === "subscription" &&
    session.status === "complete" &&
    session.payment_status === "paid"
  );
}

async function findCompletedMemberCheckoutSession(
  stripe: Stripe,
  authUserId: string,
  email: string,
  stripeCustomerId?: string | null
) {
  const customerIds = await collectStripeCustomerIds(
    stripe,
    email,
    stripeCustomerId
  );

  for (const customerId of customerIds) {
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 10,
    });

    const completedSession = sessions.data.find((session) =>
      isCompletedMemberCheckoutSession(session, authUserId)
    );

    if (completedSession) {
      return completedSession;
    }
  }

  return null;
}

async function findActiveMemberSubscription(
  stripe: Stripe,
  authUserId: string,
  email: string,
  stripeCustomerId?: string | null
) {
  const customerIds = await collectStripeCustomerIds(
    stripe,
    email,
    stripeCustomerId
  );

  for (const customerId of customerIds) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 5,
    });

    const subscription = subscriptions.data.find(
      (item) =>
        item.metadata?.auth_user_id === authUserId &&
        item.metadata?.foodvault === "member"
    );

    if (subscription) {
      return { customerId, subscription };
    }
  }

  return null;
}

export async function reconcileMemberSubscription(
  authUserId: string,
  email: string
): Promise<boolean> {
  if (!getPaymentServiceConfig().isConfigured) {
    return false;
  }

  try {
    const admin = createAdminClient();
    if (!admin) {
      return false;
    }

    const member = await resolveMemberBillingRow(admin, authUserId);
    if (memberRowHasPaidSubscription(member)) {
      return false;
    }

    const stripe = getStripeClient();
    const completedSession = await findCompletedMemberCheckoutSession(
      stripe,
      authUserId,
      email,
      member?.stripe_customer_id
    );

    if (completedSession) {
      await completeMemberSubscriptionFromCheckout(completedSession);
      return true;
    }

    const activeSubscription = await findActiveMemberSubscription(
      stripe,
      authUserId,
      email,
      member?.stripe_customer_id
    );

    if (!activeSubscription) {
      return false;
    }

    const renewalDate = subscriptionRenewalDate(activeSubscription.subscription);
    if (!renewalDate) {
      return false;
    }

    await activatePaidMemberSubscription({
      authUserId,
      stripeCustomerId: activeSubscription.customerId,
      stripeSubscriptionId: activeSubscription.subscription.id,
      renewalDate,
    });

    return true;
  } catch (error) {
    console.error("[stripe-member] Failed to reconcile member subscription", {
      authUserId,
      error: formatStripeUnknownError(error),
    });
    return false;
  }
}
