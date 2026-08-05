"use server";

import type { AccountType } from "@/lib/auth";
import { getAccountTypeFromMetadata } from "@/lib/auth";
import { enforceAuthBotProtection } from "@/lib/auth/bot-protection/enforce";
import { AFFILIATE_DASHBOARD_PATH } from "@/lib/affiliate/paths";
import { issueAndSendSignupVerification } from "@/lib/auth/email-verification";
import { findAuthUserByEmail } from "@/lib/auth/find-user-by-email";
import {
  MEMBER_HOME_PATH,
  SIGNUP_MEMBERSHIP_PATH,
} from "@/lib/member/paths";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";
import { createAdminClient } from "@/lib/supabase/admin";

function defaultNextPathForAccount(accountType: AccountType) {
  switch (accountType) {
    case "partner":
      return PARTNER_APPLICATION_PATH;
    case "affiliate":
      return AFFILIATE_DASHBOARD_PATH;
    case "member":
    default:
      return MEMBER_HOME_PATH;
  }
}

export async function resendSignupVerificationAction(
  email: string,
  accountType: AccountType,
  turnstileToken?: string | null
) {
  const trimmed = email.trim();
  if (!trimmed) {
    return { error: "Enter your email address first." };
  }

  const guard = await enforceAuthBotProtection({
    action: "email_verification",
    turnstileToken,
  });
  if (!guard.ok) {
    return { error: guard.error };
  }

  if (!createAdminClient()) {
    return { error: "Email verification is not configured in this environment." };
  }

  let user;
  try {
    user = await findAuthUserByEmail(trimmed);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to look up account.",
    };
  }

  if (!user) {
    return {
      error:
        "No account was found for that email. Check the address or sign up again.",
    };
  }

  if (user.email_confirmed_at) {
    return { error: "This email is already verified. You can log in now." };
  }

  const resolvedAccountType = getAccountTypeFromMetadata(user.user_metadata);
  if (resolvedAccountType !== accountType) {
    return {
      error:
        "This email is registered with a different FoodVault account type. Use the correct login page.",
    };
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const firstName =
    typeof metadata.first_name === "string" ? metadata.first_name : null;
  const signupMode =
    typeof metadata.signup_mode === "string" ? metadata.signup_mode : "trial";
  const nextPath =
    accountType === "member" && signupMode === "membership"
      ? SIGNUP_MEMBERSHIP_PATH
      : defaultNextPathForAccount(accountType);

  const sendResult = await issueAndSendSignupVerification({
    email: trimmed,
    firstName,
    next: nextPath,
    account: accountType,
    linkType: "invite",
  });

  if ("error" in sendResult && sendResult.error) {
    return { error: sendResult.error };
  }

  return { success: true as const };
}
