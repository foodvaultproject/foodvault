import { resolveNotificationFromEmail } from "@/lib/notification-service/from-address";

/**
 * FoodVault and StockUp share one Supabase project. Supabase Auth SMTP is not
 * configured here — this module only formats the Resend sender.
 *
 * 1. Supabase Auth
 *    - Session/token verification only (verifyOtp on /auth/confirm)
 *
 * 2. Resend via notification-service (RESEND_API_KEY)
 *    - Signup verification, password reset, trial lifecycle, partner lifecycle
 *      (application approved, listing live), admin alerts
 *    Triggered from server actions / cron when RESEND_API_KEY is set.
 *
 * The default sender stays FoodVault. StockUp mail passes brand: "stockup"
 * so a shared NOTIFICATION_FROM_EMAIL of `StockUp <hello@stockup.co.nz>`
 * is not wrapped again and is not applied to FoodVault.
 */
export function getNotificationServiceConfig() {
  const resendApiKey = process.env.RESEND_API_KEY ?? "";
  const fromEmail = resolveNotificationFromEmail({ brand: "foodvault" });
  const replyToEmail =
    process.env.NOTIFICATION_REPLY_TO_EMAIL ??
    process.env.PARTNER_SUBMISSION_ADMIN_EMAIL ??
    "mark@benchmark-int.com";
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    resendApiKey,
    fromEmail,
    replyToEmail,
    appUrl,
    isConfigured: Boolean(resendApiKey),
  };
}
