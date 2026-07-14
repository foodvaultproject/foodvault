"use server";

import { isSupabaseConfigured } from "@/lib/auth";
import {
  issueAndSendSignupVerification,
  AUTH_CHECK_EMAIL_PATH,
} from "@/lib/auth/email-verification";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

export async function createPartnerAccountAction(email: string, password: string) {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { error: "Email address is required." };
  }

  if (!isSupabaseConfigured()) {
    return { success: true as const };
  }

  const sendResult = await issueAndSendSignupVerification({
    email: trimmedEmail,
    password,
    next: PARTNER_APPLICATION_PATH,
    account: "partner",
    linkType: "signup",
    userMetadata: {
      account_type: "partner",
      partner_account_created: true,
      onboarding_step: 2,
    },
  });

  if ("error" in sendResult && sendResult.error) {
    console.error("[signup] Partner verification email failed", sendResult);
    return { error: sendResult.error };
  }

  return {
    needsEmailConfirmation: true as const,
    email: trimmedEmail,
    checkEmailPath: `${AUTH_CHECK_EMAIL_PATH}?email=${encodeURIComponent(trimmedEmail)}&account=partner`,
  };
}
