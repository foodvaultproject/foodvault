import type { AccountType } from "@/lib/auth";

export const OAUTH_INTENT_COOKIE = "fv-oauth-intent";
export const OAUTH_INTENT_CLIENT_COOKIE = "fv-oauth-intent-client";

export type OAuthIntent = {
  accountType: AccountType;
  nextPath?: string;
  signupMode?: "trial" | "membership";
  marketingOptIn?: boolean;
  flow: "signup" | "login";
};

export function readOAuthIntentCookie(
  cookieValue: string | undefined
): OAuthIntent | null {
  if (!cookieValue) {
    return null;
  }

  try {
    const decoded = cookieValue.startsWith("%7B")
      ? decodeURIComponent(cookieValue)
      : cookieValue;
    const parsed = JSON.parse(decoded) as OAuthIntent;
    if (
      parsed.accountType !== "member" &&
      parsed.accountType !== "partner" &&
      parsed.accountType !== "affiliate"
    ) {
      return null;
    }

    if (parsed.flow !== "signup" && parsed.flow !== "login") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function readOAuthIntentFromRequestCookies(
  getCookie: (name: string) => string | undefined
): OAuthIntent | null {
  return (
    readOAuthIntentCookie(getCookie(OAUTH_INTENT_COOKIE)) ??
    readOAuthIntentCookie(getCookie(OAUTH_INTENT_CLIENT_COOKIE))
  );
}

export function clearOAuthIntentCookie(
  cookieStore: { delete: (name: string) => void }
) {
  cookieStore.delete(OAUTH_INTENT_COOKIE);
  cookieStore.delete(OAUTH_INTENT_CLIENT_COOKIE);
}
