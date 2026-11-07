import { STOCKUP_ORIGIN } from "@/lib/app-mode";
import { wrapEmailContent } from "@/lib/email-templates/layout/base-layout";
import {
  emailButton,
  emailHeading,
  emailParagraph,
  escapeHtml,
} from "@/lib/email-templates/layout/components";
import {
  SUPERMARKET_EMAIL,
  renderSupermarketEmailLayout,
} from "@/lib/email-templates/layout/supermarket-layout";
import type { RenderedEmail } from "@/lib/email-templates/types";

export type MemberPasswordResetEmailParams = {
  appUrl: string;
  firstName?: string | null;
  resetUrl: string;
  brand?: "foodvault" | "stockup";
};

const STOCKUP_LOGO_URL = `${STOCKUP_ORIGIN}/Favicon/favicon_stockup.png`;

export function renderMemberPasswordResetEmail(
  params: MemberPasswordResetEmailParams
): RenderedEmail {
  if (params.brand === "stockup") {
    return renderStockUpPasswordResetEmail(params);
  }

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
    text: [
      greeting.replace(/&[^;]+;/g, ""),
      "",
      "We received a request to reset the password for your FoodVault account.",
      "Open this link to choose a new password:",
      params.resetUrl,
      "",
      "This link will expire for security. If you didn't request a password reset, you can ignore this email.",
    ].join("\n"),
  };
}

function renderStockUpPasswordResetEmail(
  params: MemberPasswordResetEmailParams
): RenderedEmail {
  const firstName = params.firstName?.trim();
  const greeting = firstName ? `Kia ora ${escapeHtml(firstName)},` : "Kia ora,";
  const resetUrl = escapeHtml(params.resetUrl);
  const green = SUPERMARKET_EMAIL.primary;
  const ink = SUPERMARKET_EMAIL.foreground;

  const content = `
    <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;font-weight:700;color:${ink};">Reset your StockUp password</h1>
    <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#374151;">${greeting}</p>
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#374151;">We received a request to reset the password for your StockUp account. Click the button below to choose a new password.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" bgcolor="${green}" style="background-color:${green};border-radius:6px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="10%" stroke="f" fillcolor="${green}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Reset Password</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;line-height:1.2;color:#ffffff;text-decoration:none;border-radius:6px;background-color:${green};">Reset Password</a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;">If the button does not open, copy this link into your browser:<br /><a href="${resetUrl}" style="color:${SUPERMARKET_EMAIL.primaryDark};word-break:break-all;">${resetUrl}</a></p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
  `;

  const plainGreeting = firstName ? `Kia ora ${firstName},` : "Kia ora,";

  return {
    subject: "Reset your StockUp password",
    html: renderSupermarketEmailLayout({
      appUrl: STOCKUP_ORIGIN,
      content,
      preheader: "Reset your StockUp password using the secure link in this email.",
      logoUrl: STOCKUP_LOGO_URL,
    }),
    text: [
      plainGreeting,
      "",
      "We received a request to reset the password for your StockUp account.",
      "Open this link to choose a new password:",
      params.resetUrl,
      "",
      "If you didn't request a password reset, you can safely ignore this email. Your password will not change.",
    ].join("\n"),
  };
}
