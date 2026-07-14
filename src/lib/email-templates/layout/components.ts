import { EMAIL_BRAND } from "@/lib/email-templates/brand";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function emailParagraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.body};">${text}</p>`;
}

export function emailHeading(text: string) {
  return `<h1 style="margin:0 0 20px;font-size:24px;line-height:1.25;font-weight:700;color:${EMAIL_BRAND.foreground};">${text}</h1>`;
}

export function emailSubheading(text: string) {
  return `<h2 style="margin:24px 0 12px;font-size:17px;line-height:1.35;font-weight:700;color:${EMAIL_BRAND.foreground};">${text}</h2>`;
}

export function emailList(items: string[]) {
  const listItems = items
    .map(
      (item) =>
        `<li style="margin:0 0 8px;font-size:15px;line-height:1.5;color:${EMAIL_BRAND.body};">${item}</li>`
    )
    .join("");

  return `<ul style="margin:0 0 16px;padding-left:20px;">${listItems}</ul>`;
}

export function emailMutedNote(text: string) {
  return `<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.muted};">${text}</p>`;
}

export function emailDivider() {
  return `<hr style="margin:24px 0;border:none;border-top:1px solid ${EMAIL_BRAND.border};" />`;
}

export function emailButton(href: string, label: string) {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);

  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0 8px;">
      <tr>
        <td align="center" style="border-radius:${EMAIL_BRAND.radiusButton};background:${EMAIL_BRAND.primaryGradient};">
          <a
            href="${safeHref}"
            style="display:inline-block;padding:12px 28px;font-family:${EMAIL_BRAND.fontFamily};font-size:14px;font-weight:600;line-height:1;color:${EMAIL_BRAND.primaryForeground};text-decoration:none;border-radius:${EMAIL_BRAND.radiusButton};mso-line-height-rule:exactly;"
          >
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>
  `.trim();
}

export function emailSecondaryLink(href: string, label: string) {
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.5;"><a href="${escapeHtml(href)}" style="color:${EMAIL_BRAND.primary};font-weight:600;text-decoration:none;">${escapeHtml(label)}</a></p>`;
}

export function emailDetailRow(label: string, value: string) {
  return `<p style="margin:0 0 10px;font-size:14px;line-height:1.5;color:${EMAIL_BRAND.body};"><strong style="color:${EMAIL_BRAND.foreground};">${escapeHtml(label)}:</strong><br />${escapeHtml(value)}</p>`;
}
