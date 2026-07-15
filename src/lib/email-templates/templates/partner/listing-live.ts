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
  const appBase = params.appUrl.replace(/\/$/, "");
  const partnerPortalUrl = `${appBase}/partner-login?next=${encodeURIComponent("/partner/listing")}`;
  const memberPreviewUrl = params.brandProfileUrl ?? null;

  const content = [
    emailHeading("Your brand is now live on FoodVault!"),
    emailParagraph(greeting),
    emailParagraph(
      `Great news — <strong>${businessName}</strong> is now live on FoodVault. Members can start discovering your brand straight away.`
    ),
    emailList([
      "Your brand profile is visible to FoodVault members",
      "Members can browse your offers and shop on your website",
      "Keep your offers and product listings up to date anytime",
    ]),
    emailButton(partnerPortalUrl, "View Your Live Listing"),
    memberPreviewUrl
      ? emailParagraph(
          `Want to see how members view your brand? <a href="${escapeHtml(memberPreviewUrl)}" style="color:#4f46e5;font-weight:600;text-decoration:none;">Preview your public listing</a>.`
        )
      : "",
    emailParagraph(
      `Log in with your partner account to manage your listing in <a href="${escapeHtml(partnerPortalUrl)}" style="color:#4f46e5;font-weight:600;text-decoration:none;">My Listing</a>.`
    ),
  ]
    .filter(Boolean)
    .join("");

  return {
    subject: "Your brand is now live on FoodVault!",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "Your FoodVault brand listing is now live for members."
    ),
  };
}
