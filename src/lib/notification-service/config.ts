/**
 * FoodVault uses two separate email channels:
 *
 * 1. Supabase Auth
 *    - Password reset links only (resetPasswordForEmail)
 *    Signup verification is sent by the app via Resend (admin generateLink only).
 *
 * 2. Resend via notification-service (RESEND_API_KEY)
 *    - Signup verification, trial lifecycle, partner lifecycle (application approved,
 *      listing live), admin alerts
 *    Triggered from server actions / cron when RESEND_API_KEY is set.
 */
export function getNotificationServiceConfig() {
  const resendApiKey = process.env.RESEND_API_KEY ?? "";
  const fromEmailRaw =
    process.env.NOTIFICATION_FROM_EMAIL ?? "FoodVault <notifications@foodvault.co.nz>";
  const fromEmail = fromEmailRaw.includes("<")
    ? fromEmailRaw
    : `FoodVault <${fromEmailRaw}>`;
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
