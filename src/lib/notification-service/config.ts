/**
 * FoodVault uses two separate email channels:
 *
 * 1. Supabase Auth (dashboard: Authentication → Email Templates)
 *    - Signup email verification
 *    - Password reset links
 *    - Partner / affiliate account confirmation
 *    Triggered by supabase.auth.signUp(), resetPasswordForEmail(), etc.
 *    The app does not send these — Supabase Auth delivers them.
 *
 * 2. Resend via notification-service (RESEND_API_KEY)
 *    - Affiliate program notifications (pre-existing)
 *    - Partner admin alerts, welcome, trial, approval emails (email-templates)
 *    Triggered from server actions / cron when RESEND_API_KEY is set.
 *
 * Supabase Auth cannot send arbitrary transactional emails (welcome, trial
 * reminders, partner approved, etc.). Resend was already in the project before
 * the email template system — templates reuse that existing integration.
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
