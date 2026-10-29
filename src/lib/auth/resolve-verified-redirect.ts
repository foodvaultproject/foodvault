import type { AccountType } from "@/lib/auth";
import { AFFILIATE_DASHBOARD_PATH } from "@/lib/affiliate/paths";
import { MEMBER_HOME_PATH, SIGNUP_MEMBERSHIP_PATH } from "@/lib/member/paths";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

export function resolveVerifiedRedirectPath(
  account: AccountType,
  metadata?: Record<string, unknown> | null
) {
  if (account === "partner") {
    return PARTNER_APPLICATION_PATH;
  }

  if (account === "affiliate") {
    return AFFILIATE_DASHBOARD_PATH;
  }

  if (metadata?.signup_mode === "stockup") {
    return MEMBER_HOME_PATH;
  }

  return SIGNUP_MEMBERSHIP_PATH;
}

export function signupPathForAccount(account: AccountType) {
  switch (account) {
    case "partner":
      return "/partner-application/create-account";
    case "affiliate":
      return "/affiliate/register";
    case "member":
    default:
      return "/signup";
  }
}
