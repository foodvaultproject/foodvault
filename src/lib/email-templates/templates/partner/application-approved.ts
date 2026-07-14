import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailList,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type PartnerApplicationApprovedEmailParams = {
  appUrl: string;
  contactName?: string | null;
  businessName: string;
};

export function renderPartnerApplicationApprovedEmail(
  params: PartnerApplicationApprovedEmailParams
): RenderedEmail {
  const contactName = params.contactName?.trim();
  const greeting = contactName ? `Kia ora ${escapeHtml(contactName)},` : "Kia ora,";
  const businessName = escapeHtml(params.businessName);
  const listingUrl = `${params.appUrl.replace(/\/$/, "")}/partner/listing`;

  const content = [
    emailHeading("Your application has been approved!"),
    emailParagraph(greeting),
    emailParagraph(
      `Great news — <strong>${businessName}</strong> has been approved on FoodVault.`
    ),
    emailParagraph(
      "Before your listing goes live, add your FoodVault member discount code to your website, then confirm in your partner dashboard."
    ),
    emailList([
      "Log in to FoodVault and open My Listing",
      "Add your member discount code to your online store",
      'Click "I\'ve Activated My Member Offer" once your code is live',
    ]),
    emailButton(listingUrl, "Go to My Listing"),
    emailParagraph(
      "We'll email you again as soon as your brand is live and visible to members."
    ),
  ].join("");

  return {
    subject: "Your FoodVault application has been approved",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "Your FoodVault brand application has been approved — one more step before going live."
    ),
  };
}
