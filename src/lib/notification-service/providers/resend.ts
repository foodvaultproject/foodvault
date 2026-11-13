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

function formatFromAddress(from?: string) {
  const value = from?.trim();
  if (!value) return null;
  return value.includes("<") ? value : `FoodVault <${value}>`;
}

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}) {
  const { fromEmail, replyToEmail } = getNotificationServiceConfig();
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from: formatFromAddress(input.from) ?? fromEmail,
    to: input.to,
    replyTo: input.replyTo ?? replyToEmail,
    subject: input.subject,
    html: input.html,
    text: input.text,
    attachments: input.attachments?.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
    })),
  });

  if (error) {
    throw new Error(error.message || "Resend rejected the email");
  }

  if (!data?.id) {
    throw new Error("Resend did not confirm the email was queued");
  }

  return data;
}
