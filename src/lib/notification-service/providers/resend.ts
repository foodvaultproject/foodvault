import { Resend } from "resend";
import { getNotificationServiceConfig } from "@/lib/notification-service/config";

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  const { resendApiKey, isConfigured } = getNotificationServiceConfig();
  if (!isConfigured) {
    throw new Error("Resend is not configured");
  }

  if (!resendClient) {
    resendClient = new Resend(resendApiKey);
  }

  return resendClient;
}

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const { fromEmail, replyToEmail } = getNotificationServiceConfig();
  const resend = getResendClient();

  return resend.emails.send({
    from: fromEmail,
    to: input.to,
    replyTo: input.replyTo ?? replyToEmail,
    subject: input.subject,
    html: input.html,
  });
}
