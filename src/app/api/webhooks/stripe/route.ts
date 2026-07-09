import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getPaymentServiceConfig } from "@/lib/payment-service/config";
import {
  completePartnerBillingSetup,
  syncStripeConnectAccountFromWebhook,
} from "@/lib/payment-service/engine";
import {
  completeMemberSubscriptionFromCheckout,
  handleMemberInvoicePaymentFailed,
  handleMemberInvoicePaymentSucceeded,
  syncMemberSubscriptionState,
} from "@/lib/payment-service/providers/stripe-member";
import { getStripeClient } from "@/lib/payment-service/providers/stripe-client";

export async function POST(request: NextRequest) {
  const { webhookSecret } = getPaymentServiceConfig();
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await syncStripeConnectAccountFromWebhook(account.id);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "setup" && session.metadata?.partner_id && session.customer) {
          const setupIntentId = session.setup_intent;
          if (typeof setupIntentId === "string") {
            const stripe = getStripeClient();
            const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
            const paymentMethodId =
              typeof setupIntent.payment_method === "string"
                ? setupIntent.payment_method
                : setupIntent.payment_method?.id;

            if (paymentMethodId) {
              await completePartnerBillingSetup({
                partnerId: session.metadata.partner_id,
                customerId: String(session.customer),
                paymentMethodId,
              });
            }
          }
        }
        if (
          session.mode === "subscription" &&
          session.metadata?.foodvault === "member" &&
          session.metadata?.auth_user_id
        ) {
          try {
            await completeMemberSubscriptionFromCheckout(session);
          } catch (error) {
            console.error(
              "[stripe-webhook] completeMemberSubscriptionFromCheckout failed",
              {
                eventId: event.id,
                eventType: event.type,
                sessionId: session.id,
                authUserId: session.metadata.auth_user_id,
                error:
                  error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message,
                        stack: error.stack,
                        cause: error.cause,
                      }
                    : error,
              }
            );
            throw error;
          }
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncMemberSubscriptionState(subscription);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleMemberInvoicePaymentSucceeded(invoice);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleMemberInvoicePaymentFailed(invoice);
        break;
      }
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe-webhook] Webhook handler failed", {
      eventId: event.id,
      eventType: event.type,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
              cause: error.cause,
            }
          : error,
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
