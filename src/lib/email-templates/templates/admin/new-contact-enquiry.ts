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
  const referenceNumber = requireField(params.referenceNumber, "referenceNumber");
  const name = requireField(params.name, "name");
  const email = requireField(params.email, "email");
  const enquiryType = requireField(params.enquiryType, "enquiryType");
  const subjectLine = requireField(params.subject, "subject");
  const message = requireField(params.message, "message");

  const contactCentreUrl = `${appUrl}/admin/contact?q=${encodeURIComponent(referenceNumber)}`;
  const subject = `[FoodVault Contact Centre] New Enquiry: ${subjectLine} (${referenceNumber})`;

  const content = [
    emailHeading("New contact enquiry"),
    emailParagraph(
      "A new FoodVault contact enquiry has been submitted and is waiting in the Contact Centre."
    ),
    emailDetailRow("Reference number", referenceNumber),
    emailDetailRow("Name", name),
    emailDetailRow("Email", email),
    emailDetailRow("Enquiry type", enquiryType),
    emailDetailRow("Subject", subjectLine),
    emailParagraph("<strong>Message</strong>"),
    emailMessageBlock(message),
    emailButton(contactCentreUrl, "Open Contact Centre"),
  ].join("");

  const text = [
    "New FoodVault contact enquiry",
    "",
    `Reference number: ${referenceNumber}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Enquiry type: ${enquiryType}`,
    `Subject: ${subjectLine}`,
    "",
    "Message:",
    message,
    "",
    `Open Contact Centre: ${contactCentreUrl}`,
  ].join("\n");

  return {
    subject,
    html: wrapEmailContent(
      appUrl,
      content,
      `New FoodVault enquiry ${referenceNumber} from ${escapeHtml(name)}.`
    ),
    text,
  };
}
