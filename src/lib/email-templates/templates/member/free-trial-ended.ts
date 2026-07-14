import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailList,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type MemberFreeTrialEndedEmailParams = {
  appUrl: string;
  firstName?: string | null;
};

export function renderMemberFreeTrialEndedEmail(
  params: MemberFreeTrialEndedEmailParams
): RenderedEmail {
  const firstName = params.firstName?.trim();
  const greeting = firstName ? `Kia ora ${escapeHtml(firstName)},` : "Kia ora,";
  const browseUrl = `${params.appUrl.replace(/\/$/, "")}/browse-brands`;
  const pricingUrl = `${params.appUrl.replace(/\/$/, "")}/pricing`;

  const content = [
    emailHeading("Your free trial has ended"),
    emailParagraph(greeting),
    emailParagraph(
      "Your FoodVault free trial has finished — but your account is still here and you can keep browsing brands anytime."
    ),
    emailList([
      "Your account still works — log in whenever you like",
      "You can still explore participating Kiwi brands",
      "Member discount codes are now locked until you subscribe",
    ]),
    emailParagraph(
      "Subscribe anytime to unlock your member savings again and access exclusive discount codes from participating brands."
    ),
    emailButton(pricingUrl, "Subscribe to Unlock Savings"),
    emailParagraph(
      `Or <a href="${escapeHtml(browseUrl)}" style="color:#4f46e5;font-weight:600;text-decoration:none;">keep browsing brands</a> at your own pace.`
    ),
  ].join("");

  return {
    subject: "Your free trial has ended",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "Your FoodVault free trial has ended — subscribe anytime to unlock savings again."
    ),
  };
}
