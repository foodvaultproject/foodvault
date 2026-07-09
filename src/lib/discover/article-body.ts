const HTML_BLOCK_TAG_PATTERN =
  /<(p|div|h[1-6]|ul|ol|li|blockquote|pre|section|article|table|thead|tbody|tr|td|th)\b/i;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** True when the stored body already contains HTML block markup. */
export function isArticleBodyHtml(body: string): boolean {
  const trimmed = body.trim();
  if (!trimmed.includes("<")) return false;
  return HTML_BLOCK_TAG_PATTERN.test(trimmed);
}

/**
 * Converts plain-text article bodies (as entered in the admin textarea) into
 * semantic HTML paragraphs. Each Enter in the editor becomes its own <p>.
 */
export function plainTextToArticleHtml(body: string): string {
  const normalized = body.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");

  const paragraphs = lines.filter((line) => line.length > 0);
  if (paragraphs.length === 0) return "";

  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

/** Prepare article body for public rendering. */
export function formatArticleBodyHtml(body: string | null): string {
  if (!body?.trim()) return "";

  const trimmed = body.trim();
  if (isArticleBodyHtml(trimmed)) return trimmed;

  return plainTextToArticleHtml(trimmed);
}

/**
 * Converts stored HTML back to plain text for the admin textarea when needed.
 */
export function articleHtmlToPlainText(body: string | null): string {
  if (!body?.trim()) return "";
  if (!isArticleBodyHtml(body)) return body;

  return body
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/?(p|div|h[1-6]|li|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
