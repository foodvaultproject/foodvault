import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import { EMAIL_BRAND } from "@/lib/email-templates/brand";
import {
  emailButton,
  emailDetailRow,
  emailHeading,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type AdminNewContactEnquiryEmailParams = {
  appUrl: string;
  referenceNumber: string;
  name: string;
  email: string;
  enquiryType: string;
  subject: string;
  message: string;
};

function emailMessageBlock(message: string) {
  const escaped = escapeHtml(message).replace(/\r\n|\r|\n/g, "<br />");
  return `<div style="margin:8px 0 20px;padding:16px;background:${EMAIL_BRAND.surface};border:1px solid ${EMAIL_BRAND.border};border-radius:${EMAIL_BRAND.radiusCard};font-size:14px;line-height:1.6;color:${EMAIL_BRAND.body};">${escaped}</div>`;
}

function requireField(value: string | undefined, name: string) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new Error(`Contact enquiry email missing required field: ${name}`);
  }
  return trimmed;
}

export function renderAdminNewContactEnquiryEmail(
  params: AdminNewContactEnquiryEmailParams
): RenderedEmail {
  const appUrl = requireField(params.appUrl, "appUrl").replace(/\/$/, "");
  const name = requireField(params.name, "name");
  const email = requireField(params.email, "email");
  const subjectLine = requireField(params.subject, "subject");
  const message = requireField(params.message, "message");

  const dashboardUrl = `${appUrl}/admin/dashboard`;
  const subject = `New contact form message from ${name}`;

  const content = [
    emailHeading("New contact form message"),
    emailParagraph("Log in to the admin dashboard to review this enquiry."),
    emailDetailRow("From", `${name} (${email})`),
    emailDetailRow("Subject", subjectLine),
    emailParagraph("<strong>Message</strong>"),
    emailMessageBlock(message),
    emailButton(dashboardUrl, "Log in to the admin dashboard"),
  ].join("");

  const text = [
    "New contact form message",
    "",
    "Log in to the admin dashboard to review this enquiry.",
    "",
    `From: ${name} (${email})`,
    `Subject: ${subjectLine}`,
    "",
    "Message:",
    message,
    "",
    `Admin dashboard: ${dashboardUrl}`,
  ].join("\n");

  return {
    subject,
    html: wrapEmailContent(
      appUrl,
      content,
      `New contact form message from ${escapeHtml(name)}. Log in to the admin dashboard to review it.`
    ),
    text,
  };
}
