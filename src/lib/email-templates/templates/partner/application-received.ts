import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailHeading,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type PartnerApplicationReceivedEmailParams = {
  appUrl: string;
  contactName?: string | null;
  businessName: string;
};

export function renderPartnerApplicationReceivedEmail(
  params: PartnerApplicationReceivedEmailParams
): RenderedEmail {
  const contactName = params.contactName?.trim();
  const greeting = contactName ? `Kia ora ${escapeHtml(contactName)},` : "Kia ora,";
  const businessName = escapeHtml(params.businessName);

  const content = [
    emailHeading("We've received your application"),
    emailParagraph(greeting),
    emailParagraph(
      `Thanks for joining FoodVault! We've received your application for <strong>${businessName}</strong> and our team will review it shortly.`
    ),
    emailParagraph(
      "Reviews usually take around 24 hours. Once your brand is approved, we'll email you with everything you need to get started."
    ),
    emailParagraph(
      "In the meantime, sit tight — we'll be in touch soon."
    ),
  ].join("");

  return {
    subject: "We've received your FoodVault application",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "Thanks for applying — we've received your FoodVault brand application."
    ),
  };
}
