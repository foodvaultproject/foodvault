import type { AccountType } from "@/lib/auth";
import { AFFILIATE_DASHBOARD_PATH } from "@/lib/affiliate/paths";
import {
  SIGNUP_MEMBERSHIP_PATH,
  SIGNUP_WELCOME_PATH,
} from "@/lib/member/paths";
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

  const signupMode =
    typeof metadata?.signup_mode === "string" ? metadata.signup_mode : "trial";

  return signupMode === "membership" ? SIGNUP_MEMBERSHIP_PATH : SIGNUP_WELCOME_PATH;
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
