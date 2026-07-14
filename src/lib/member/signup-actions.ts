"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured, SIGNUP_PATH } from "@/lib/auth";
import {
  AUTH_CHECK_EMAIL_PATH,
  issueAndSendSignupVerification,
} from "@/lib/auth/email-verification";
import { resendSignupVerificationAction } from "@/lib/auth/resend-verification";
import {
  SIGNUP_MEMBERSHIP_PATH,
  SIGNUP_WELCOME_PATH,
} from "@/lib/member/paths";
import { createClient } from "@/lib/supabase/server";

export type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  password: string;
  confirmPassword: string;
  marketingOptIn: boolean;
};

function validateSignupForm(data: SignupFormData): string | null {
  if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim()) {
    return "All fields are required.";
  }
  if (data.password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (data.password !== data.confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

export async function createMemberAccountAction(
  data: SignupFormData,
  mode: "trial" | "membership"
) {
  const validationError = validateSignupForm(data);
  if (validationError) {
    return { error: validationError };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true as const,
      redirectTo: mode === "trial" ? SIGNUP_WELCOME_PATH : SIGNUP_MEMBERSHIP_PATH,
    };
  }

  const email = data.email.trim();
  const nextPath = mode === "trial" ? SIGNUP_WELCOME_PATH : SIGNUP_MEMBERSHIP_PATH;

  const sendResult = await issueAndSendSignupVerification({
    email,
    password: data.password,
    firstName: data.firstName.trim(),
    next: nextPath,
    account: "member",
    linkType: "signup",
    userMetadata: {
      account_type: "member",
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      signup_mode: mode,
      country: data.country,
      marketing_opt_in: data.marketingOptIn,
    },
  });

  if ("error" in sendResult && sendResult.error) {
    console.error("[signup] Member verification email failed", sendResult);
    return { error: sendResult.error };
  }

  return {
    needsEmailConfirmation: true as const,
    email,
    checkEmailPath: `${AUTH_CHECK_EMAIL_PATH}?email=${encodeURIComponent(email)}&account=member`,
  };
}

export async function requireMemberSession() {
  if (!isSupabaseConfigured()) {
    return { id: "dev-member", email: "member@example.com" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(SIGNUP_PATH);
  }

  if (!user.email_confirmed_at) {
    redirect(
      `${AUTH_CHECK_EMAIL_PATH}?email=${encodeURIComponent(user.email)}&account=member`
    );
  }

  return { id: user.id, email: user.email };
}

export async function resendMemberSignupConfirmationAction(email: string) {
  return resendSignupVerificationAction(email, "member");
}
