export function getNotificationServiceConfig() {
  const resendApiKey = process.env.RESEND_API_KEY ?? "";
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL ?? "FoodVault <notifications@foodvault.co.nz>";
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    resendApiKey,
    fromEmail,
    appUrl,
    isConfigured: Boolean(resendApiKey),
  };
}
