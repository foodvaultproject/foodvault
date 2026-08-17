import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type PartnerHospitalityListingLiveEmailParams = {
  appUrl: string;
  contactName?: string | null;
  businessName: string;
  listingUrl?: string | null;
};

export function renderPartnerHospitalityListingLiveEmail(
  params: PartnerHospitalityListingLiveEmailParams
): RenderedEmail {
  const contactName = params.contactName?.trim();
  const greeting = contactName ? `Kia ora ${escapeHtml(contactName)},` : "Kia ora,";
  const businessName = escapeHtml(params.businessName);
  const appBase = params.appUrl.replace(/\/$/, "");
  const partnerPortalUrl = `${appBase}/partner-login?next=${encodeURIComponent("/partner/listing")}`;
  const listingUrl = params.listingUrl ?? null;

  const content = [
    emailHeading("Your listing is now live on FoodVault"),
    emailParagraph(greeting),
    emailParagraph(
      `Great news — <strong>${businessName}</strong> is now live on FoodVault. Members can discover your venue straight away.`
    ),
    emailParagraph("No further action is required."),
    emailButton(partnerPortalUrl, "View Your Live Listing"),
    listingUrl
      ? emailParagraph(
          `Want to see how members view your listing? <a href="${escapeHtml(listingUrl)}" style="color:#8b7cf6;font-weight:600;text-decoration:none;">Preview your public listing</a>.`
        )
      : "",
    emailParagraph(
      `Log in with your partner account to manage your listing in <a href="${escapeHtml(partnerPortalUrl)}" style="color:#8b7cf6;font-weight:600;text-decoration:none;">My Listing</a>.`
    ),
  ]
    .filter(Boolean)
    .join("");

  return {
    subject: "Your FoodVault listing is now live",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "Your FoodVault hospitality listing is now live for members. No further action is required."
    ),
  };
}
