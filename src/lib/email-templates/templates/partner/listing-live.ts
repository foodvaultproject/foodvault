import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailList,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type PartnerListingLiveEmailParams = {
  appUrl: string;
  contactName?: string | null;
  businessName: string;
  brandProfileUrl?: string | null;
};

export function renderPartnerListingLiveEmail(
  params: PartnerListingLiveEmailParams
): RenderedEmail {
  const contactName = params.contactName?.trim();
  const greeting = contactName ? `Kia ora ${escapeHtml(contactName)},` : "Kia ora,";
  const businessName = escapeHtml(params.businessName);
  const listingUrl = `${params.appUrl.replace(/\/$/, "")}/partner/listing`;
  const profileUrl =
    params.brandProfileUrl ??
    `${params.appUrl.replace(/\/$/, "")}/browse-brands`;

  const content = [
    emailHeading("Your brand is now live on FoodVault!"),
    emailParagraph(greeting),
    emailParagraph(
      `Great news — <strong>${businessName}</strong> has been approved and your listing is now live on FoodVault. Members can start discovering your brand straight away.`
    ),
    emailList([
      "Your brand profile is visible to FoodVault members",
      "Members can browse your offers and shop on your website",
      "Keep your offers and product listings up to date anytime",
    ]),
    emailButton(profileUrl, "View Your Live Listing"),
    emailParagraph(
      `Manage your listing anytime from your <a href="${escapeHtml(listingUrl)}" style="color:#4f46e5;font-weight:600;text-decoration:none;">partner dashboard</a>.`
    ),
  ].join("");

  return {
    subject: "Your brand is now live on FoodVault!",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "Your FoodVault brand listing is now live for members."
    ),
  };
}
