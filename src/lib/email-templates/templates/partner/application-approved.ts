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
  memberCode?: string | null;
};

export function renderPartnerApplicationApprovedEmail(
  params: PartnerApplicationApprovedEmailParams
): RenderedEmail {
  const contactName = params.contactName?.trim();
  const greeting = contactName ? `Kia ora ${escapeHtml(contactName)},` : "Kia ora,";
  const businessName = escapeHtml(params.businessName);
  const loginUrl = `${params.appUrl.replace(/\/$/, "")}/partner-login`;
  const listingUrl = `${params.appUrl.replace(/\/$/, "")}/partner/listing`;
  const memberCode = params.memberCode?.trim();

  const content = [
    emailHeading("Your application is approved — action required"),
    emailParagraph(greeting),
    emailParagraph(
      `Great news — <strong>${businessName}</strong> has been approved on FoodVault.`
    ),
    emailParagraph(
      "Your listing is <strong>not live yet</strong>. Before members can discover your brand, complete this one-time setup step:"
    ),
    emailList([
      "Log in to your FoodVault partner account",
      "Add your FoodVault member discount code to your website checkout",
      'Open My Listing and click "I\'ve Activated My Member Offer" in the orange banner',
    ]),
    memberCode
      ? emailParagraph(
          `Your FoodVault member discount code: <strong style="font-size:18px;letter-spacing:0.04em;">${escapeHtml(memberCode)}</strong>`
        )
      : "",
    emailButton(loginUrl, "Log in to FoodVault"),
    emailParagraph(
      `After you confirm in My Listing, we'll send a final email when <strong>${businessName}</strong> is live for members.`
    ),
    emailParagraph(
      `Need help? Open <a href="${escapeHtml(listingUrl)}" style="color:#4f46e5;font-weight:600;text-decoration:none;">My Listing</a> once you're logged in.`
    ),
  ]
    .filter(Boolean)
    .join("");

  return {
    subject: "Your FoodVault application is approved — action required",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "Your FoodVault brand application has been approved. Log in and confirm your member discount code is live on your website."
    ),
  };
}
