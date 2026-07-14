import { EMAIL_BRAND, emailLogoUrl, emailWebsiteUrl } from "@/lib/email-templates/brand";
import { escapeHtml } from "@/lib/email-templates/layout/components";
import type { EmailLayoutOptions } from "@/lib/email-templates/types";

export function renderEmailLayout({ appUrl, content, preheader }: EmailLayoutOptions) {
  const logoUrl = emailLogoUrl(appUrl);
  const websiteUrl = emailWebsiteUrl(appUrl);
  const year = new Date().getFullYear();
  const preheaderText = preheader ? escapeHtml(preheader) : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>FoodVault</title>
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @media only screen and (max-width: 620px) {
        .fv-email-shell { width: 100% !important; }
        .fv-email-body { padding: 24px 20px !important; }
        .fv-email-footer { padding: 20px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;width:100%;background-color:${EMAIL_BRAND.pageBackground};font-family:${EMAIL_BRAND.fontFamily};color:${EMAIL_BRAND.body};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    ${
      preheaderText
        ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${preheaderText}</div>`
        : ""
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${EMAIL_BRAND.pageBackground};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" class="fv-email-shell" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:${EMAIL_BRAND.background};border:1px solid ${EMAIL_BRAND.border};border-radius:${EMAIL_BRAND.radiusCard};overflow:hidden;">
            <tr>
              <td align="center" style="padding:28px 32px 12px;background-color:${EMAIL_BRAND.background};">
                <a href="${escapeHtml(websiteUrl)}" style="text-decoration:none;">
                  <img src="${escapeHtml(logoUrl)}" width="180" height="45" alt="FoodVault" style="display:block;width:180px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;" />
                </a>
              </td>
            </tr>
            <tr>
              <td class="fv-email-body" style="padding:8px 32px 28px;font-family:${EMAIL_BRAND.fontFamily};">
                ${content}
              </td>
            </tr>
            <tr>
              <td class="fv-email-footer" style="padding:24px 32px;background-color:${EMAIL_BRAND.surface};border-top:1px solid ${EMAIL_BRAND.border};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding-bottom:12px;">
                      <img src="${escapeHtml(logoUrl)}" width="110" height="28" alt="FoodVault" style="display:block;width:110px;height:auto;margin:0 auto;border:0;" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="font-size:13px;line-height:1.6;color:${EMAIL_BRAND.muted};">
                      <p style="margin:0 0 8px;">
                        <a href="${escapeHtml(websiteUrl)}" style="color:${EMAIL_BRAND.primary};font-weight:600;text-decoration:none;">${EMAIL_BRAND.websiteDisplay}</a>
                      </p>
                      <p style="margin:0 0 8px;">
                        Need a hand? Email us at
                        <a href="mailto:${EMAIL_BRAND.supportEmail}" style="color:${EMAIL_BRAND.primary};text-decoration:none;">${EMAIL_BRAND.supportEmail}</a>
                      </p>
                      <p style="margin:0 0 8px;font-size:12px;color:${EMAIL_BRAND.mutedLight};">
                        &copy; ${year} FoodVault. All rights reserved.
                      </p>
                      <p style="margin:0;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.body};">
                        Thanks for being part of FoodVault — we're glad you're here. Kia ora!
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function wrapEmailContent(appUrl: string, content: string, preheader?: string) {
  return renderEmailLayout({ appUrl, content, preheader });
}
