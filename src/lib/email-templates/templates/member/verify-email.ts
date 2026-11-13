import { STOCKUP_ORIGIN, stockupSafePath } from "@/lib/app-mode";
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

export type MemberVerifyEmailBrand = "foodvault" | "stockup";

export type MemberVerifyEmailParams = {
  appUrl: string;
  firstName?: string | null;
  verificationUrl: string;
  brand?: MemberVerifyEmailBrand;
};

const STOCKUP_LOGO_URL = `${STOCKUP_ORIGIN}/Favicon/favicon_stockup.png`;
const STOCKUP_SUBJECT = "Welcome to StockUp! - Confirm your email address";

export function renderMemberVerifyEmail(
  params: MemberVerifyEmailParams
): RenderedEmail {
  if (params.brand === "stockup") {
    return renderStockUpVerifyEmail(params);
  }

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

function stockupHref(raw: string, fallbackPath = "/") {
  try {
    const url = new URL(raw);
    url.protocol = "https:";
    url.host = new URL(STOCKUP_ORIGIN).host;
    url.pathname = stockupSafePath(url.pathname);
    return url.toString();
  } catch {
    return `${STOCKUP_ORIGIN}${stockupSafePath(fallbackPath)}`;
  }
}

function renderStockUpVerifyEmail(params: MemberVerifyEmailParams): RenderedEmail {
  const firstName = params.firstName?.trim();
  const greeting = firstName ? `Kia ora ${escapeHtml(firstName)},` : "";
  const loginUrl = `${STOCKUP_ORIGIN}/login`;
  const verificationUrl = escapeHtml(stockupHref(params.verificationUrl));
  const green = SUPERMARKET_EMAIL.primary;
  const ink = SUPERMARKET_EMAIL.foreground;

  const content = `
    <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;font-weight:700;color:${ink};">Welcome to StockUp!</h1>
    ${
      greeting
        ? `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#374151;">${greeting}</p>`
        : ""
    }
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#374151;">Thanks for joining StockUp! Please confirm your email address by clicking the button below so you can start placing orders.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" bgcolor="${green}" style="background-color:${green};border-radius:6px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verificationUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="8%" stroke="f" fillcolor="${green}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Confirm Email &amp; Get Started</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${verificationUrl}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;line-height:1.2;color:#ffffff;text-decoration:none;border-radius:6px;background-color:${green};">Confirm Email &amp; Get Started</a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;">If the button does not open, copy this link into your browser:<br /><a href="${verificationUrl}" style="color:${SUPERMARKET_EMAIL.primaryDark};word-break:break-all;">${verificationUrl}</a></p>
    <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;">If you didn't create an account with StockUp, you can safely ignore this email.</p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;">Need to start again? <a href="${escapeHtml(loginUrl)}" style="color:${SUPERMARKET_EMAIL.primaryDark};font-weight:700;text-decoration:none;">Go back to StockUp login</a>.</p>
  `;

  const text = [
    "Welcome to StockUp!",
    firstName ? `Kia ora ${firstName},` : "",
    "Thanks for joining StockUp! Please confirm your email address by clicking the button below so you can start placing orders.",
    stockupHref(params.verificationUrl),
    `Go back to StockUp login: ${loginUrl}`,
    "If you didn't create an account with StockUp, you can safely ignore this email.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    subject: STOCKUP_SUBJECT,
    html: renderSupermarketEmailLayout({
      appUrl: STOCKUP_ORIGIN,
      content,
      preheader:
        "Thanks for joining StockUp! Confirm your email address to start placing orders.",
      logoUrl: STOCKUP_LOGO_URL,
    }),
    text,
  };
}
