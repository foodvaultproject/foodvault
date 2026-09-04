/** Collapse Gemini / HTML double-encoding before storage or render. */
export function unescapeArticleEntities(text: string): string {
  return text.replace(/&amp;amp;/g, "&").replace(/&amp;/g, "&");
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function sanitizeArticleHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  return null;
}

/** Turn `[Text](URL)` into a safe clickable `<a>` without touching existing HTML. */
export function markdownLinksToHtml(text: string): string {
  return text.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (_match, label: string, href: string) => {
      const safe = sanitizeArticleHref(href);
      if (!safe) return label;
      return `<a href="${escapeAttr(safe)}">${label}</a>`;
    }
  );
}

export function prepareGeneratedMarkdown(text: string): string {
  return markdownLinksToHtml(unescapeArticleEntities(text));
}
