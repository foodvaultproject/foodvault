import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailList,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type MemberWelcomeEmailParams = {
  appUrl: string;
  firstName?: string | null;
};

export function renderMemberWelcomeEmail(
  params: MemberWelcomeEmailParams
): RenderedEmail {
  const firstName = params.firstName?.trim();
  const greeting = firstName ? `Kia ora ${escapeHtml(firstName)},` : "Kia ora,";
  const browseUrl = `${params.appUrl.replace(/\/$/, "")}/browse-brands`;

  const content = [
    emailHeading("Welcome to FoodVault! 🎉"),
    emailParagraph(greeting),
    emailParagraph(
      "You're in! FoodVault connects you with Kiwi food, beverage, household and health brands offering exclusive member savings — and you buy direct on each brand's own website."
    ),
    emailList([
      "Browse participating New Zealand brands",
      "Unlock member discount codes when your membership is active",
      "Shop directly with the brands you love",
    ]),
    emailButton(browseUrl, "Start Browsing Brands"),
    emailParagraph(
      "If you have any questions along the way, our team is always happy to help."
    ),
  ].join("");

  return {
    subject: "Welcome to FoodVault! 🎉",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "Welcome to FoodVault — your member savings journey starts here."
    ),
  };
}
