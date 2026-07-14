import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type MemberVerifyEmailParams = {
  appUrl: string;
  firstName?: string | null;
  verificationUrl: string;
};

export function renderMemberVerifyEmail(
  params: MemberVerifyEmailParams
): RenderedEmail {
  const firstName = params.firstName?.trim();
  const greeting = firstName ? `Kia ora ${escapeHtml(firstName)},` : "Kia ora,";

  const content = [
    emailHeading("Verify your email address"),
    emailParagraph(greeting),
    emailParagraph(
      "Before you get started, we just need to confirm this is the right email address for your FoodVault account."
    ),
    emailParagraph("Tap the button below to verify your email — it only takes a moment."),
    emailButton(params.verificationUrl, "Verify Email Address"),
    emailParagraph(
      "If you didn't create a FoodVault account, you can safely ignore this email."
    ),
  ].join("");

  return {
    subject: "Verify your FoodVault email address",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "Please verify your FoodVault email address to continue."
    ),
  };
}
