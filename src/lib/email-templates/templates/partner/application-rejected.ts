import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import { EMAIL_BRAND } from "@/lib/email-templates/brand";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type PartnerApplicationRejectedEmailParams = {
  appUrl: string;
  contactName?: string | null;
  businessName: string;
};

export function renderPartnerApplicationRejectedEmail(
  params: PartnerApplicationRejectedEmailParams
): RenderedEmail {
  const contactName = params.contactName?.trim();
  const greeting = contactName ? `Kia ora ${escapeHtml(contactName)},` : "Kia ora,";
  const businessName = escapeHtml(params.businessName);
  const supportEmail = EMAIL_BRAND.supportEmail;

  const content = [
    emailHeading("Update on your FoodVault application"),
    emailParagraph(greeting),
    emailParagraph(
      `Thanks again for applying to join FoodVault with <strong>${businessName}</strong>. After reviewing your application, we're not able to approve it at this stage.`
    ),
    emailParagraph(
      "We know that's disappointing — if you'd like to understand more or discuss next steps, our team is happy to help."
    ),
    emailButton(`mailto:${supportEmail}`, "Contact Support"),
    emailParagraph(
      "We appreciate you taking the time to apply and hope to hear from you again in the future."
    ),
  ].join("");

  return {
    subject: "Update on your FoodVault application",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "An update on your FoodVault brand application."
    ),
  };
}
