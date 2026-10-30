"use server";

import { headers } from "next/headers";
import type { AccountType } from "@/lib/auth";
import { getAccountTypeFromMetadata } from "@/lib/auth";
import { authGuardFailure, enforceAuthBotProtection } from "@/lib/auth/bot-protection/enforce";
import { supabaseAuthCaptchaOptions } from "@/lib/auth/supabase-captcha";
import { getAppMode, STOCKUP_ORIGIN } from "@/lib/app-mode";
import { AFFILIATE_DASHBOARD_PATH } from "@/lib/affiliate/paths";
import { issueAndSendSignupVerification } from "@/lib/auth/email-verification";
import { findAuthUserByEmail } from "@/lib/auth/find-user-by-email";
import {
  MEMBER_HOME_PATH,
  SIGNUP_MEMBERSHIP_PATH,
} from "@/lib/member/paths";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

const STOCKUP_CONFIRM_REDIRECT = `${STOCKUP_ORIGIN}/auth/callback?next=${encodeURIComponent(MEMBER_HOME_PATH)}&account=member`;

async function isStockUpRequest(brand?: string | null) {
  if (brand === "stockup") return true;
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  return getAppMode(host) === "stockup";
}

async function resendStockUpSignupEmail(
  email: string,
  turnstileToken?: string | null
) {
  const captcha = supabaseAuthCaptchaOptions(turnstileToken);
  if (!("captchaToken" in captcha)) {
    return { error: "Please complete the CAPTCHA check before resending." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: STOCKUP_CONFIRM_REDIRECT,
      ...captcha,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true as const };
}

export async function resendSignupVerificationAction(
  email: string,
  accountType: AccountType,
  turnstileToken?: string | null,
  brand?: string | null
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
    return authGuardFailure(guard);
  }

  if (!createAdminClient()) {
    if (await isStockUpRequest(brand)) {
      return resendStockUpSignupEmail(trimmed, turnstileToken);
    }
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
  const stockupMember = accountType === "member" && metadata.signup_mode === "stockup";
  const nextPath = stockupMember
    ? MEMBER_HOME_PATH
    : accountType === "member"
      ? SIGNUP_MEMBERSHIP_PATH
      : defaultNextPathForAccount(accountType);

  const sendResult = await issueAndSendSignupVerification({
    email: trimmed,
    firstName,
    next: nextPath,
    account: accountType,
    linkType: "invite",
    siteOrigin: stockupMember ? STOCKUP_ORIGIN : undefined,
  });

  if ("error" in sendResult && sendResult.error) {
    return { error: sendResult.error };
  }

  return { success: true as const };
}
