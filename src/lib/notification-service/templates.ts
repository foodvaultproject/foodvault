import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import { getNotificationServiceConfig } from "@/lib/notification-service/config";
import type { NotificationEventRow, RenderedNotification } from "@/lib/notification-service/types";

function layout(content: string, preheader?: string) {
  const { appUrl } = getNotificationServiceConfig();
  return wrapEmailContent(appUrl, content, preheader);
}

export function renderNotification(event: NotificationEventRow): RenderedNotification | null {
  const payload = event.payload ?? {};
  const amount = payload.amount != null ? String(payload.amount) : null;
  const currency = String(payload.currency ?? "NZD");
  const clickCount = payload.click_count != null ? String(payload.click_count) : null;

  switch (event.event_type) {
    case "NEW_AFFILIATE_REGISTERED":
      return {
        title: "New affiliate joined",
        body: "A new affiliate is now promoting your brand.",
        subject: "New affiliate joined your program",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">A new affiliate joined your FoodVault affiliate program and a referral link was created.</p>",
          "A new affiliate joined your FoodVault affiliate program."
        ),
      };
    case "FIRST_CLICK":
      return {
        title: "First affiliate click",
        body: "Your affiliate program recorded its first referral click.",
        subject: "First affiliate click recorded",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">Great news — your affiliate program just recorded its first referral click.</p>",
          "Your affiliate program recorded its first referral click."
        ),
      };
    case "CLICK_MILESTONE":
      return {
        title: `${clickCount ?? "Milestone"} clicks reached`,
        body: `Your affiliate program reached ${clickCount ?? "a new"} referral clicks.`,
        subject: `Affiliate click milestone: ${clickCount ?? "milestone"}`,
        html: layout(
          `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Your affiliate program reached ${clickCount ?? "a new"} referral clicks.</p>`,
          `Your affiliate program reached ${clickCount ?? "a new"} referral clicks.`
        ),
      };
    case "FIRST_SALE":
      return {
        title: "First affiliate sale",
        body: "An attributed order was recorded through your affiliate program.",
        subject: "First affiliate sale recorded",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">An attributed order was recorded through your affiliate program.</p>",
          "Your affiliate program recorded its first sale."
        ),
      };
    case "COMMISSION_APPROVED":
      return {
        title: "Commission approved",
        body: amount
          ? `$${amount} ${currency} moved from pending to approved.`
          : "A commission moved from pending to approved.",
        subject: "Your commission was approved",
        html: layout(
          amount
            ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Your commission of $${amount} ${currency} has been approved and is eligible for payout.</p>`
            : "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">One of your commissions has been approved and is eligible for payout.</p>",
          "Your FoodVault affiliate commission was approved."
        ),
      };
    case "AFFILIATE_PAYMENT_SENT":
      return {
        title: "Payout sent",
        body: amount ? `$${amount} ${currency} payout was sent.` : "Your payout was sent.",
        subject: "Your affiliate payout was sent",
        html: layout(
          amount
            ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Your payout of $${amount} ${currency} has been sent through Stripe Connect.</p>`
            : "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">Your payout has been sent through Stripe Connect.</p>",
          "Your FoodVault affiliate payout was sent."
        ),
      };
    case "PAYOUT_FAILED":
      return {
        title: "Payout failed",
        body: "A payout could not be completed. Check your Stripe Connect account.",
        subject: "Affiliate payout failed",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">A payout could not be completed. Please review your Stripe Connect payout settings.</p>",
          "A FoodVault affiliate payout could not be completed."
        ),
      };
    case "STORE_CONNECTED":
      return {
        title: "Store connected",
        body: "Your Shopify store is connected for affiliate attribution.",
        subject: "Shopify store connected",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">Your Shopify store is now connected for affiliate order attribution.</p>",
          "Your Shopify store is connected to FoodVault."
        ),
      };
    case "STORE_DISCONNECTED":
      return {
        title: "Store disconnected",
        body: "Your store integration was disconnected.",
        subject: "Store integration disconnected",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">Your store integration was disconnected. Reconnect to continue tracking affiliate orders.</p>",
          "Your store integration was disconnected."
        ),
      };
    case "INVOICE_GENERATED":
      return {
        title: "Commission invoice generated",
        body: "A monthly affiliate commission invoice was generated.",
        subject: "Affiliate commission invoice generated",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">A monthly affiliate commission invoice was generated for your account.</p>",
          "A monthly affiliate commission invoice was generated."
        ),
      };
    case "PAYMENT_SUCCESS":
      return {
        title: "Payment successful",
        body: "Your affiliate commission invoice was paid successfully.",
        subject: "Affiliate commission payment successful",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">Your affiliate commission invoice was paid successfully.</p>",
          "Your affiliate commission payment was successful."
        ),
      };
    case "PAYMENT_FAILED":
      return {
        title: "Payment failed",
        body: "Your affiliate commission payment failed. Update your billing method.",
        subject: "Affiliate commission payment failed",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">Your affiliate commission payment failed. Please update your billing method in Partner Billing.</p>",
          "Your affiliate commission payment failed."
        ),
      };
    case "AFFILIATE_WELCOME":
      return {
        title: "Welcome to FoodVault Affiliates",
        body: "Your affiliate account is ready. Start sharing referral links.",
        subject: "Welcome to FoodVault Affiliates",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">Your affiliate account is ready. Visit your dashboard to copy referral links and start earning.</p>",
          "Welcome to FoodVault Affiliates."
        ),
      };
    case "MONTHLY_SUMMARY":
      return {
        title: "Monthly summary ready",
        body: "Your monthly affiliate summary is available.",
        subject: "Your monthly affiliate summary",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">Your monthly affiliate summary is ready in your dashboard.</p>",
          "Your monthly FoodVault affiliate summary is ready."
        ),
      };
    case "WEBHOOK_FAILURE":
      return {
        title: "Store webhook failure",
        body: "A store webhook failed and may need attention.",
        subject: "Store webhook failure detected",
        html: layout(
          "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;\">A store webhook failed and may need attention in the admin health dashboard.</p>",
          "A store webhook failure was detected."
        ),
      };
    default:
      return null;
  }
}
