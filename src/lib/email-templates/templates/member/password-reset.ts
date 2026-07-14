import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type MemberPasswordResetEmailParams = {
  appUrl: string;
  firstName?: string | null;
  resetUrl: string;
};

export function renderMemberPasswordResetEmail(
  params: MemberPasswordResetEmailParams
): RenderedEmail {
  const firstName = params.firstName?.trim();
  const greeting = firstName ? `Kia ora ${escapeHtml(firstName)},` : "Kia ora,";

  const content = [
    emailHeading("Reset your password"),
    emailParagraph(greeting),
    emailParagraph(
      "We received a request to reset the password for your FoodVault account. Tap the button below to choose a new password."
    ),
    emailButton(params.resetUrl, "Reset Password"),
    emailParagraph(
      "This link will expire for security. If you didn't request a password reset, you can safely ignore this email — your password won't change."
    ),
  ].join("");

  return {
    subject: "Reset your FoodVault password",
    html: wrapEmailContent(
      params.appUrl,
      content,
      "Reset your FoodVault password using the secure link in this email."
    ),
  };
}
