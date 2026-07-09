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
