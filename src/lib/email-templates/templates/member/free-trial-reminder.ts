import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type MemberFreeTrialReminderEmailParams = {
  appUrl: string;
  firstName?: string | null;
  daysRemaining: 1 | 3;
};

export function renderMemberFreeTrialReminderEmail(
  params: MemberFreeTrialReminderEmailParams
): RenderedEmail {
  const firstName = params.firstName?.trim();
  const greeting = firstName ? `Kia ora ${escapeHtml(firstName)},` : "Kia ora,";
  const pricingUrl = `${params.appUrl.replace(/\/$/, "")}/pricing`;
  const daysLabel =
    params.daysRemaining === 1 ? "1 day" : `${params.daysRemaining} days`;

  const content = [
    emailHeading(`Your free trial ends in ${daysLabel}`),
    emailParagraph(greeting),
    emailParagraph(
      `Just a friendly heads-up — your FoodVault free trial wraps up in ${daysLabel}. If you're enjoying the member savings, now's a great time to upgrade and keep your discount codes unlocked.`
    ),
    emailButton(pricingUrl, "Upgrade Now"),
    emailParagraph(
      "No pressure at all — you can still browse brands anytime. Upgrade whenever it suits you."
    ),
  ].join("");

  const subject =
    params.daysRemaining === 1
      ? "Your FoodVault free trial ends tomorrow"
      : "Your FoodVault free trial ends in 3 days";

  return {
    subject,
    html: wrapEmailContent(
      params.appUrl,
      content,
      `Your FoodVault free trial ends in ${daysLabel}.`
    ),
  };
}
