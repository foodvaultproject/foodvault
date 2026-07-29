import type { OAuthIntent } from "@/lib/auth/oauth-intent";

export const OAUTH_INTENT_CLIENT_COOKIE = "fv-oauth-intent-client";
export const PARTNER_OAUTH_SESSION_KEY = "fv-partner-oauth-signup";

export function storeOAuthIntentClient(intent: OAuthIntent) {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${OAUTH_INTENT_CLIENT_COOKIE}=${encodeURIComponent(JSON.stringify(intent))}; path=/; max-age=600; SameSite=Lax${secure}`;
}

export function markPartnerOAuthSignup() {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.setItem(PARTNER_OAUTH_SESSION_KEY, "1");
}

export function consumePartnerOAuthSignup(): boolean {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  const value = sessionStorage.getItem(PARTNER_OAUTH_SESSION_KEY) === "1";
  sessionStorage.removeItem(PARTNER_OAUTH_SESSION_KEY);
  return value;
}

export function isPartnerOAuthNextPath(nextPath: string | null | undefined): boolean {
  if (!nextPath?.startsWith("/")) {
    return false;
  }

  return (
    nextPath === "/partner-application" ||
    nextPath.startsWith("/partner-application/") ||
    nextPath.startsWith("/partner/")
  );
}
