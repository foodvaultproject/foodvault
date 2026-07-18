import type { AccountType } from "@/lib/auth";
import {
  OAUTH_INTENT_COOKIE,
  readOAuthIntentCookie,
  type OAuthIntent,
} from "@/lib/auth/oauth-intent";
import {
  ensureAuthenticatedSession,
  readMetadataString,
  type SessionCompletionContext,
} from "@/lib/auth/session-completion";
import { getAccountTypeFromMetadata } from "@/lib/auth";

export function validateOAuthAccountType(
  user: { user_metadata?: Record<string, unknown> },
  expectedType: AccountType
): boolean {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const existingType = readMetadataString(metadata, "account_type");

  if (
    existingType &&
    getAccountTypeFromMetadata(metadata) !== expectedType
  ) {
    return false;
  }

  const signupCompletedAt = readMetadataString(metadata, "signup_completed_at");
  if (!signupCompletedAt) {
    return true;
  }

  return getAccountTypeFromMetadata(metadata) === expectedType;
}

export function parseOAuthCallbackContext(
  searchParams: URLSearchParams,
  cookieIntent: OAuthIntent | null
): SessionCompletionContext & { expectedAccountType: AccountType } {
  const accountFromQuery = searchParams.get("account");
  const expectedAccountType: AccountType =
    accountFromQuery === "partner"
      ? "partner"
      : accountFromQuery === "affiliate"
        ? "affiliate"
        : cookieIntent?.accountType ?? "member";

  const signupModeParam = searchParams.get("signup_mode");
  const signupModeFromQuery =
    signupModeParam === "membership" || signupModeParam === "trial"
      ? signupModeParam
      : undefined;

  const marketingParam = searchParams.get("marketing_opt_in");
  const marketingOptInFromQuery =
    marketingParam === "1"
      ? true
      : marketingParam === "0"
        ? false
        : undefined;

  return {
    expectedAccountType,
    nextPath: searchParams.get("next") ?? cookieIntent?.nextPath ?? null,
    signupMode: signupModeFromQuery ?? cookieIntent?.signupMode,
    marketingOptIn: marketingOptInFromQuery ?? cookieIntent?.marketingOptIn,
  };
}

export { ensureAuthenticatedSession, OAUTH_INTENT_COOKIE, readOAuthIntentCookie };
