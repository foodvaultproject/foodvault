import type { NotificationEventRow, RenderedNotification } from "@/lib/notification-service/types";

function layout(content: string) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:32px;">
            <tr><td style="font-size:24px;font-weight:700;color:#0f172a;">FoodVault</td></tr>
            <tr><td style="padding-top:24px;font-size:15px;line-height:1.6;">${content}</td></tr>
            <tr><td style="padding-top:24px;font-size:12px;color:#64748b;">FoodVault Affiliate Program</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
        html: layout("A new affiliate joined your FoodVault affiliate program and a referral link was created."),
      };
    case "FIRST_CLICK":
      return {
        title: "First affiliate click",
        body: "Your affiliate program recorded its first referral click.",
        subject: "First affiliate click recorded",
        html: layout("Great news — your affiliate program just recorded its first referral click."),
      };
    case "CLICK_MILESTONE":
      return {
        title: `${clickCount ?? "Milestone"} clicks reached`,
        body: `Your affiliate program reached ${clickCount ?? "a new"} referral clicks.`,
        subject: `Affiliate click milestone: ${clickCount ?? "milestone"}`,
        html: layout(`Your affiliate program reached ${clickCount ?? "a new"} referral clicks.`),
      };
    case "FIRST_SALE":
      return {
        title: "First affiliate sale",
        body: "An attributed order was recorded through your affiliate program.",
        subject: "First affiliate sale recorded",
        html: layout("An attributed order was recorded through your affiliate program."),
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
            ? `Your commission of $${amount} ${currency} has been approved and is eligible for payout.`
            : "One of your commissions has been approved and is eligible for payout."
        ),
      };
    case "AFFILIATE_PAYMENT_SENT":
      return {
        title: "Payout sent",
        body: amount ? `$${amount} ${currency} payout was sent.` : "Your payout was sent.",
        subject: "Your affiliate payout was sent",
        html: layout(
          amount
            ? `Your payout of $${amount} ${currency} has been sent through Stripe Connect.`
            : "Your payout has been sent through Stripe Connect."
        ),
      };
    case "PAYOUT_FAILED":
      return {
        title: "Payout failed",
        body: "A payout could not be completed. Check your Stripe Connect account.",
        subject: "Affiliate payout failed",
        html: layout("A payout could not be completed. Please review your Stripe Connect payout settings."),
      };
    case "STORE_CONNECTED":
      return {
        title: "Store connected",
        body: "Your Shopify store is connected for affiliate attribution.",
        subject: "Shopify store connected",
        html: layout("Your Shopify store is now connected for affiliate order attribution."),
      };
    case "STORE_DISCONNECTED":
      return {
        title: "Store disconnected",
        body: "Your store integration was disconnected.",
        subject: "Store integration disconnected",
        html: layout("Your store integration was disconnected. Reconnect to continue tracking affiliate orders."),
      };
    case "INVOICE_GENERATED":
      return {
        title: "Commission invoice generated",
        body: "A monthly affiliate commission invoice was generated.",
        subject: "Affiliate commission invoice generated",
        html: layout("A monthly affiliate commission invoice was generated for your account."),
      };
    case "PAYMENT_SUCCESS":
      return {
        title: "Payment successful",
        body: "Your affiliate commission invoice was paid successfully.",
        subject: "Affiliate commission payment successful",
        html: layout("Your affiliate commission invoice was paid successfully."),
      };
    case "PAYMENT_FAILED":
      return {
        title: "Payment failed",
        body: "Your affiliate commission payment failed. Update your billing method.",
        subject: "Affiliate commission payment failed",
        html: layout("Your affiliate commission payment failed. Please update your billing method in Partner Billing."),
      };
    case "AFFILIATE_WELCOME":
      return {
        title: "Welcome to FoodVault Affiliates",
        body: "Your affiliate account is ready. Start sharing referral links.",
        subject: "Welcome to FoodVault Affiliates",
        html: layout("Your affiliate account is ready. Visit your dashboard to copy referral links and start earning."),
      };
    case "MONTHLY_SUMMARY":
      return {
        title: "Monthly summary ready",
        body: "Your monthly affiliate summary is available.",
        subject: "Your monthly affiliate summary",
        html: layout("Your monthly affiliate summary is ready in your dashboard."),
      };
    case "WEBHOOK_FAILURE":
      return {
        title: "Store webhook failure",
        body: "A store webhook failed and may need attention.",
        subject: "Store webhook failure detected",
        html: layout("A store webhook failed and may need attention in the admin health dashboard."),
      };
    default:
      return null;
  }
}
