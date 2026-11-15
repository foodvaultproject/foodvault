export const DISCOVER_ARTICLE_AUTHOR = "Mark, Kiwi & Piggy";
export const STOCKUP_ARTICLE_AUTHOR = "StockUp Team";
export const STOCKUP_PUBLISHER_NAME = "Britomart Groceries Limited t/a StockUp";

const LEGACY_DISCOVER_AUTHORS = new Set([
  "System Administrator",
  "Admin User",
]);

export function resolveDiscoverAuthorName(authorName: string | null | undefined) {
  const trimmed = authorName?.trim();
  if (!trimmed || LEGACY_DISCOVER_AUTHORS.has(trimmed)) {
    return DISCOVER_ARTICLE_AUTHOR;
  }

  return trimmed;
}
