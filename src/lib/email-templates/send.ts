import { getNotificationServiceConfig } from "@/lib/notification-service/config";
import { sendResendEmail } from "@/lib/notification-service/providers/resend";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type SendPlatformEmailInput = {
  to: string;
  rendered: RenderedEmail;
};

export type SendPlatformEmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "invalid_recipient" };

export async function sendPlatformEmail(
  input: SendPlatformEmailInput
): Promise<SendPlatformEmailResult> {
  const recipient = input.to.trim();
  if (!recipient || !recipient.includes("@")) {
    return { sent: false, reason: "invalid_recipient" };
  }

  const { isConfigured } = getNotificationServiceConfig();
  if (!isConfigured) {
    console.warn("[email-templates] Skipping email — Resend is not configured", {
      subject: input.rendered.subject,
      to: recipient,
    });
    return { sent: false, reason: "not_configured" };
  }

  await sendResendEmail({
    to: recipient,
    subject: input.rendered.subject,
    html: input.rendered.html,
  });

  return { sent: true };
}

export function getEmailAppUrl() {
  return getNotificationServiceConfig().appUrl;
}

export async function sendPlatformEmailSafe(
  input: SendPlatformEmailInput
): Promise<SendPlatformEmailResult> {
  try {
    return await sendPlatformEmail(input);
  } catch (error) {
    console.error("[email-templates] Failed to send email", {
      subject: input.rendered.subject,
      to: input.to,
      error: error instanceof Error ? error.message : error,
    });
    return { sent: false, reason: "not_configured" };
  }
}
