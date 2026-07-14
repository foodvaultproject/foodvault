"use server";

import { isSupabaseConfigured } from "@/lib/auth";
import {
  AUTH_CHECK_EMAIL_PATH,
  issueAndSendSignupVerification,
} from "@/lib/auth/email-verification";
import { AFFILIATE_DASHBOARD_PATH } from "@/lib/affiliate/paths";
import type { AffiliateRegistrationInput } from "@/lib/affiliate/types";

export async function createAffiliateAccountAction(input: AffiliateRegistrationInput) {
  if (!input.firstName.trim() || !input.lastName.trim()) {
    return { error: "First name and last name are required." };
  }

  if (!input.email.trim()) {
    return { error: "Email address is required." };
  }

  const email = input.email.trim();

  if (!isSupabaseConfigured()) {
    return { success: true as const };
  }

  const sendResult = await issueAndSendSignupVerification({
    email,
    password: input.password,
    firstName: input.firstName.trim(),
    next: AFFILIATE_DASHBOARD_PATH,
    account: "affiliate",
    linkType: "signup",
    userMetadata: {
      account_type: "affiliate",
      affiliate_account_created: true,
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      country: input.country.trim() || "New Zealand",
      capabilities: ["affiliate"],
    },
  });

  if ("error" in sendResult && sendResult.error) {
    console.error("[signup] Affiliate verification email failed", sendResult);
    return { error: sendResult.error };
  }

  return {
    needsEmailConfirmation: true as const,
    email,
    checkEmailPath: `${AUTH_CHECK_EMAIL_PATH}?email=${encodeURIComponent(email)}&account=affiliate`,
  };
}
