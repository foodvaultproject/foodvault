import type { DiscoverFaq } from "@/lib/admin/types";

export function normalizeMetaTag(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function parseMetaTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [...new Set(value.map((entry) => normalizeMetaTag(String(entry))).filter(Boolean))];
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parseMetaTags(parsed);
      }
    } catch {
      // Fall through to comma-separated parsing.
    }

    return [
      ...new Set(
        value
          .split(/[,;\n]/)
          .map((entry) => normalizeMetaTag(entry))
          .filter(Boolean)
      ),
    ];
  }

  return [];
}

export function serializeMetaTagsForForm(tags: string[]): string {
  return JSON.stringify(parseMetaTags(tags));
}

export function parseDiscoverFaqs(value: unknown): DiscoverFaq[] {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string" && value.trim()
      ? (() => {
          try {
            return JSON.parse(value) as unknown;
          } catch {
            return [];
          }
        })()
      : [];

  if (!Array.isArray(source)) return [];

  return source
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const question = String((entry as { question?: unknown }).question ?? "").trim();
      const answer = String((entry as { answer?: unknown }).answer ?? "").trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((entry): entry is DiscoverFaq => entry !== null);
}
