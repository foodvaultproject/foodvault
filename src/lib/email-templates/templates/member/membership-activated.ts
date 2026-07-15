import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailList,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";
import { MEMBER_HOME_PATH } from "@/lib/member/paths";

export type MemberMembershipActivatedEmailParams = {
  appUrl: string;
  firstName?: string | null;
};

export function renderMemberMembershipActivatedEmail(
  params: MemberMembershipActivatedEmailParams
): RenderedEmail {
  const firstName = params.firstName?.trim();
  const greeting = firstName ? `Kia ora ${escapeHtml(firstName)},` : "Kia ora,";
  const browseUrl = `${params.appUrl.replace(/\/$/, "")}${MEMBER_HOME_PATH}`;
  const dashboardUrl = `${params.appUrl.replace(/\/$/, "")}/dashboard`;

  const content = [
    emailHeading("Welcome to FoodVault Membership!"),
    emailParagraph(greeting),
    emailParagraph(
      "You're all set! Your FoodVault membership is now active — you've got full access to exclusive member savings from participating New Zealand brands."
    ),
    emailList([
      "Unlock member discount codes on brand profiles",
      "Browse and shop directly with Kiwi brands",
      "Manage your membership anytime from your account",
    ]),
    emailButton(browseUrl, "Start Saving"),
    emailParagraph(
      `Visit your <a href="${escapeHtml(dashboardUrl)}" style="color:#4f46e5;font-weight:600;text-decoration:none;">member dashboard</a> anytime to manage your account.`
    ),
  ].join("");

  return {
    subject: "Welcome to FoodVault Membership!",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "Your FoodVault membership is now active."
    ),
  };
}
