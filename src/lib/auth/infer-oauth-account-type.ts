import type { AccountType } from "@/lib/auth";
import type { OAuthIntent } from "@/lib/auth/oauth-intent";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

const PARTNER_NEXT_PATH_PREFIXES = [
  PARTNER_APPLICATION_PATH,
  "/partner-application/",
  "/partner/",
] as const;

export function inferAccountTypeFromNextPath(
  nextPath: string | null | undefined
): AccountType | null {
  if (!nextPath?.startsWith("/")) {
    return null;
  }

  if (
    PARTNER_NEXT_PATH_PREFIXES.some(
      (prefix) => nextPath === prefix || nextPath.startsWith(prefix)
    )
  ) {
    return "partner";
  }

  if (nextPath.startsWith("/affiliate")) {
    return "affiliate";
  }

  return null;
}

export function resolveOAuthExpectedAccountType(options: {
  accountFromQuery: string | null;
  cookieIntent: OAuthIntent | null;
  nextPath: string | null;
}): AccountType {
  const { accountFromQuery, cookieIntent, nextPath } = options;

  if (
    accountFromQuery === "partner" ||
    accountFromQuery === "affiliate" ||
    accountFromQuery === "member"
  ) {
    return accountFromQuery;
  }

  if (cookieIntent?.accountType) {
    return cookieIntent.accountType;
  }

  return inferAccountTypeFromNextPath(nextPath) ?? "member";
}
