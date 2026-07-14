import { AUTH_CHECK_EMAIL_PATH } from "@/lib/auth/email-verification";

const PUBLIC_PREFIXES = [
  "/auth/",
  "/login",
  "/partner-login",
  "/affiliate/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/pricing",
  "/browse-brands",
  "/terms",
  "/privacy",
  "/partner-terms",
  "/affiliate-terms",
  "/affiliate-program",
  "/affiliate/register",
  "/partner-application/create-account",
  "/how-it-works",
  "/contact",
  "/about",
];

const PUBLIC_EXACT = new Set([
  "/",
  AUTH_CHECK_EMAIL_PATH,
]);

export function pathAllowsUnverifiedAccess(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
