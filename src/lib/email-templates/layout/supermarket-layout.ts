import { EMAIL_BRAND } from "@/lib/email-templates/brand";
import { escapeHtml } from "@/lib/email-templates/layout/components";
import { STOCKUP_ORIGIN } from "@/lib/app-mode";

/** Supermarket chrome: FoodVault green, matching the storefront header. */
const SUPERMARKET = {
  primary: "#10B981",
  primaryDark: "#047857",
  pageBackground: "#F0FDF4",
  surface: "#ECFDF5",
  border: "#A7F3D0",
  foreground: "#064E3B",
} as const;

export function renderSupermarketEmailLayout({
  appUrl,
  content,
  preheader,
}: {
  appUrl: string;
  content: string;
  preheader?: string;
}) {
  const websiteUrl = appUrl.replace(/\/$/, "") || STOCKUP_ORIGIN;
  const year = new Date().getFullYear();
  const preheaderText = preheader ? escapeHtml(preheader) : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StockUp</title>
  </head>
  <body style="margin:0;padding:0;width:100%;background-color:${SUPERMARKET.pageBackground};font-family:${EMAIL_BRAND.fontFamily};color:${EMAIL_BRAND.body};">
    ${
      preheaderText
        ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheaderText}</div>`
        : ""
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${SUPERMARKET.pageBackground};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:#ffffff;border:1px solid ${SUPERMARKET.border};border-radius:10px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:28px 32px;background-color:${SUPERMARKET.primary};">
                <a href="${escapeHtml(websiteUrl)}" style="font-size:28px;line-height:1;font-weight:700;letter-spacing:-0.03em;color:#ffffff;text-decoration:none;">StockUp</a>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-family:${EMAIL_BRAND.fontFamily};">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;background-color:${SUPERMARKET.surface};border-top:1px solid ${SUPERMARKET.border};text-align:center;font-size:13px;line-height:1.6;color:${EMAIL_BRAND.muted};">
                <p style="margin:0 0 8px;">
                  <a href="${escapeHtml(websiteUrl)}" style="color:${SUPERMARKET.primaryDark};font-weight:700;text-decoration:none;">stockup.co.nz</a>
                </p>
                <p style="margin:0 0 8px;">
                  Need a hand? Email
                  <a href="mailto:${EMAIL_BRAND.supportEmail}" style="color:${SUPERMARKET.primaryDark};text-decoration:none;">${EMAIL_BRAND.supportEmail}</a>
                </p>
                <p style="margin:0;">&copy; ${year} StockUp. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export const SUPERMARKET_EMAIL = SUPERMARKET;
