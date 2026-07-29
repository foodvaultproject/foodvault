import type { AccountType } from "@/lib/auth";
import {
  OAUTH_INTENT_COOKIE,
  OAUTH_INTENT_CLIENT_COOKIE,
  readOAuthIntentCookie,
  readOAuthIntentFromRequestCookies,
  type OAuthIntent,
} from "@/lib/auth/oauth-intent";
import { resolveOAuthExpectedAccountType } from "@/lib/auth/infer-oauth-account-type";
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
    if (
      expectedType === "partner" &&
      getAccountTypeFromMetadata(metadata) === "member" &&
      metadata.partner_account_created !== true
    ) {
      return true;
    }

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
  const nextPath = searchParams.get("next") ?? cookieIntent?.nextPath ?? null;
  const expectedAccountType = resolveOAuthExpectedAccountType({
    accountFromQuery: searchParams.get("account"),
    cookieIntent,
    nextPath,
  });

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
    nextPath,
    signupMode: signupModeFromQuery ?? cookieIntent?.signupMode,
    marketingOptIn: marketingOptInFromQuery ?? cookieIntent?.marketingOptIn,
  };
}

export {
  ensureAuthenticatedSession,
  OAUTH_INTENT_COOKIE,
  OAUTH_INTENT_CLIENT_COOKIE,
  readOAuthIntentFromRequestCookies,
  readOAuthIntentCookie,
};
