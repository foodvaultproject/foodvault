import type { AccountType } from "@/lib/auth";

export const OAUTH_INTENT_COOKIE = "fv-oauth-intent";

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
    const parsed = JSON.parse(cookieValue) as OAuthIntent;
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

export function clearOAuthIntentCookie(
  cookieStore: { delete: (name: string) => void }
) {
  cookieStore.delete(OAUTH_INTENT_COOKIE);
}
