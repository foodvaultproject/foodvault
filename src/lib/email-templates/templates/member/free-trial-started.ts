import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailList,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type MemberFreeTrialStartedEmailParams = {
  appUrl: string;
  firstName?: string | null;
  trialLengthDays: number;
};

function trialLengthLabel(days: number) {
  if (days === 1) return "1-day";
  return `${days}-day`;
}

export function renderMemberFreeTrialStartedEmail(
  params: MemberFreeTrialStartedEmailParams
): RenderedEmail {
  const firstName = params.firstName?.trim();
  const greeting = firstName ? `Kia ora ${escapeHtml(firstName)},` : "Kia ora,";
  const browseUrl = `${params.appUrl.replace(/\/$/, "")}/browse-brands`;
  const pricingUrl = `${params.appUrl.replace(/\/$/, "")}/pricing`;
  const trialLabel = trialLengthLabel(params.trialLengthDays);

  const content = [
    emailHeading("Your free trial has started!"),
    emailParagraph(greeting),
    emailParagraph(
      `Your ${trialLabel} FoodVault free trial is now active. You've got full member access while your trial runs — time to explore what's on offer.`
    ),
    emailList([
      `Your trial runs for ${params.trialLengthDays} ${params.trialLengthDays === 1 ? "day" : "days"}`,
      "Browse participating Kiwi brands and unlock member discount codes",
      "Upgrade anytime if you'd like to keep your savings going",
    ]),
    emailButton(browseUrl, "Browse Brands"),
    emailParagraph(
      `When you're ready, you can upgrade from your account or visit our <a href="${escapeHtml(pricingUrl)}" style="color:#4f46e5;font-weight:600;text-decoration:none;">membership page</a>.`
    ),
  ].join("");

  return {
    subject: "Your FoodVault free trial has started!",
    html: wrapEmailContent(
      params.appUrl,
      content,
      `Your ${trialLabel} FoodVault free trial is now active.`
    ),
  };
}
