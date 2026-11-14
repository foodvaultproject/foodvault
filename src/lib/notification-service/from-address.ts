export const FOODVAULT_FROM_EMAIL = "FoodVault <hello@foodvault.co.nz>";
export const STOCKUP_FROM_EMAIL = "StockUp <hello@stockup.co.nz>";

export type NotificationBrand = "foodvault" | "stockup";

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

type ParsedFrom = {
  name: string | null;
  email: string;
};

function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }
  return value;
}

function mailboxHost(email: string) {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function hostBrand(email: string): NotificationBrand | null {
  const host = mailboxHost(email);
  if (host === "stockup.co.nz" || host.endsWith(".stockup.co.nz")) return "stockup";
  if (host === "foodvault.co.nz" || host.endsWith(".foodvault.co.nz")) return "foodvault";
  return null;
}

/**
 * Reads a from address that may already be `Name <email@domain>`.
 * A second `Name <...>` wrapper, or a value whose brackets were lost, is not
 * treated as a bare address.
 */
export function parseFromAddress(raw: string | null | undefined): ParsedFrom | null {
  const value = stripWrappingQuotes(raw?.trim() ?? "");
  if (!value) return null;

  const emails = value.match(EMAIL_PATTERN);
  if (!emails?.length) return null;
  const email = emails[emails.length - 1];

  if (!value.includes("<")) {
    return value === email ? { name: null, email } : null;
  }

  const name = value
    .slice(0, value.indexOf("<"))
    .replace(/["']/g, "")
    .replace(/[<>]/g, "")
    .trim();

  return { name: name || null, email };
}

function displayNameFor(parsed: ParsedFrom, brand: NotificationBrand) {
  const owner = hostBrand(parsed.email);
  const otherBrandName =
    (owner === "stockup" && parsed.name === "FoodVault") ||
    (owner === "foodvault" && parsed.name === "StockUp");
  if (parsed.name && !otherBrandName) return parsed.name;
  if (owner === "stockup") return "StockUp";
  if (owner === "foodvault") return "FoodVault";
  return brand === "stockup" ? "StockUp" : "FoodVault";
}

export function formatMailbox(name: string, email: string) {
  const safeName = name.replace(/[<>]/g, "").trim();
  return safeName ? `${safeName} <${email}>` : email;
}

function brandEnv(brand: NotificationBrand) {
  return brand === "stockup"
    ? process.env.STOCKUP_NOTIFICATION_FROM_EMAIL
    : process.env.FOODVAULT_NOTIFICATION_FROM_EMAIL;
}

function defaultFallback(brand: NotificationBrand) {
  return brand === "stockup" ? STOCKUP_FROM_EMAIL : FOODVAULT_FROM_EMAIL;
}

/**
 * Resolves one Resend `from` value.
 * FoodVault ignores a StockUp mailbox in the shared env, and StockUp ignores a
 * FoodVault mailbox, so the shared Supabase project keeps its own sender.
 * An env value that already contains `Name <email>` is returned once.
 */
export function resolveNotificationFromEmail(options?: {
  brand?: NotificationBrand;
  raw?: string | null;
  fallback?: string;
}) {
  const brand = options?.brand ?? "foodvault";
  const fallback = options?.fallback ?? defaultFallback(brand);
  const explicit = options?.raw?.trim() ? options.raw : null;
  const candidates = [explicit, brandEnv(brand), process.env.NOTIFICATION_FROM_EMAIL];

  for (const candidate of candidates) {
    const parsed = parseFromAddress(candidate);
    if (!parsed) continue;
    const owner = hostBrand(parsed.email);
    const isExplicit = candidate === explicit;
    if (!isExplicit && owner && owner !== brand) continue;
    return formatMailbox(displayNameFor(parsed, brand), parsed.email);
  }

  return fallback;
}
