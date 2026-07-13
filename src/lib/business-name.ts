export const MAX_BUSINESS_NAME_LENGTH = 25;
export const MAX_CONTACT_NAME_LENGTH = 50;

function capitalizeWord(word: string): string {
  const match = word.match(/^([^A-Za-z]*)([A-Za-z])([\s\S]*)$/);
  if (!match) {
    return word;
  }

  const [, prefix, firstLetter, rest] = match;
  return `${prefix}${firstLetter.toUpperCase()}${rest.toLowerCase()}`;
}

/** Collapse repeated whitespace to a single space. */
export function collapseBusinessNameSpaces(value: string): string {
  return value.replace(/\s+/g, " ");
}

/** Format a business name to Title Case for storage and display. */
export function formatBusinessName(value: string): string {
  const collapsed = collapseBusinessNameSpaces(value.trim());
  if (!collapsed) {
    return "";
  }

  return collapsed.split(" ").map(capitalizeWord).join(" ");
}

export function formatBusinessNameOrNull(
  value: string | null | undefined
): string | null {
  if (value == null) {
    return null;
  }

  const formatted = formatBusinessName(value);
  return formatted || null;
}

/** Live input formatting while typing (preserves a trailing space between words). */
export function formatBusinessNameInput(
  raw: string,
  maxLength = MAX_BUSINESS_NAME_LENGTH
): string {
  const collapsed = collapseBusinessNameSpaces(raw);
  const trailingSpace = collapsed.endsWith(" ") ? " " : "";
  const core = collapsed.trim();

  if (!core) {
    return collapsed.slice(0, maxLength);
  }

  const formatted = core.split(" ").map(capitalizeWord).join(" ");
  return (formatted + trailingSpace).slice(0, maxLength);
}

/** Finalise a business name field on blur or before save. */
export function finalizeBusinessNameInput(
  raw: string,
  maxLength = MAX_BUSINESS_NAME_LENGTH
): string {
  return formatBusinessName(raw).slice(0, maxLength);
}
