/**
 * Auth emails are exact-match. Plus-tags (mark+test@domain) are not separate
 * accounts; resolve them to the registered local-part when looking up a user.
 */
export function authEmailCandidates(email: string): string[] {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return [];
  }

  const at = trimmed.lastIndexOf("@");
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const candidates = [trimmed];

  const plus = local.indexOf("+");
  if (plus > 0 && domain) {
    candidates.push(`${local.slice(0, plus)}@${domain}`);
  }

  return [...new Set(candidates)];
}
