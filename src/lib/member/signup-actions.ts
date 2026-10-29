"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured, SIGNUP_PATH } from "@/lib/auth";
import {
  finalizeBusinessNameInput,
  MAX_CONTACT_NAME_LENGTH,
} from "@/lib/business-name";
import {
  AUTH_CHECK_EMAIL_PATH,
  getSiteUrl,
  issueAndSendSignupVerification,
} from "@/lib/auth/email-verification";
import { enforceAuthBotProtection } from "@/lib/auth/bot-protection/enforce";
import { supabaseAuthCaptchaOptions } from "@/lib/auth/supabase-captcha";
import { resendSignupVerificationAction } from "@/lib/auth/resend-verification";
import { MEMBER_HOME_PATH, SIGNUP_MEMBERSHIP_PATH } from "@/lib/member/paths";
import { createAdminClient } from "@/lib/supabase/admin";
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
  turnstileToken?: string | null
) {
  const validationError = validateSignupForm(data);
  if (validationError) {
    return { error: validationError };
  }

  const guard = await enforceAuthBotProtection({
    action: "email_verification",
    turnstileToken,
  });
  if (!guard.ok) {
    return { error: guard.error };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true as const,
      redirectTo: SIGNUP_MEMBERSHIP_PATH,
    };
  }

  const email = data.email.trim();
  const firstName = finalizeBusinessNameInput(
    data.firstName.trim(),
    MAX_CONTACT_NAME_LENGTH
  );
  const lastName = finalizeBusinessNameInput(
    data.lastName.trim(),
    MAX_CONTACT_NAME_LENGTH
  );

  const sendResult = await issueAndSendSignupVerification({
    email,
    password: data.password,
    firstName,
    next: SIGNUP_MEMBERSHIP_PATH,
    account: "member",
    linkType: "signup",
    userMetadata: {
      account_type: "member",
      first_name: firstName,
      last_name: lastName,
      signup_mode: "membership",
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

export async function createStockUpAccountAction(
  data: Pick<
    SignupFormData,
    "firstName" | "lastName" | "email" | "password" | "confirmPassword"
  >,
  turnstileToken?: string | null
) {
  const validationError = validateSignupForm({
    ...data,
    country: "New Zealand",
    marketingOptIn: false,
  });
  if (validationError) {
    return { error: validationError };
  }

  const guard = await enforceAuthBotProtection({
    action: "email_verification",
    turnstileToken,
  });
  if (!guard.ok) {
    return { error: guard.error };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true as const,
      redirectTo: MEMBER_HOME_PATH,
    };
  }

  const email = data.email.trim();
  const firstName = finalizeBusinessNameInput(
    data.firstName.trim(),
    MAX_CONTACT_NAME_LENGTH
  );
  const lastName = finalizeBusinessNameInput(
    data.lastName.trim(),
    MAX_CONTACT_NAME_LENGTH
  );

  const userMetadata = {
    account_type: "member",
    first_name: firstName,
    last_name: lastName,
    signup_mode: "stockup",
    country: "New Zealand",
    marketing_opt_in: false,
  };

  if (createAdminClient()) {
    const sendResult = await issueAndSendSignupVerification({
      email,
      password: data.password,
      firstName,
      next: MEMBER_HOME_PATH,
      account: "member",
      linkType: "signup",
      userMetadata,
    });

    if ("error" in sendResult && sendResult.error) {
      console.error("[signup] StockUp verification email failed", sendResult);
      return { error: sendResult.error };
    }

    return {
      needsEmailConfirmation: true as const,
      email,
      checkEmailPath: `${AUTH_CHECK_EMAIL_PATH}?email=${encodeURIComponent(email)}&account=member&brand=stockup`,
    };
  }

  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${proto}://${forwardedHost.split(",")[0]?.trim()}`
    : getSiteUrl();
  const captcha = supabaseAuthCaptchaOptions(turnstileToken);
  if (!("captchaToken" in captcha)) {
    return {
      error: "Please complete the CAPTCHA check before creating your account.",
    };
  }

  const supabase = await createClient();
  const { data: signedUp, error: signUpError } = await supabase.auth.signUp({
    email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(MEMBER_HOME_PATH)}&account=member`,
      data: userMetadata,
      ...captcha,
    },
  });

  if (signUpError) {
    console.error("[signup] StockUp signUp failed", signUpError);
    return { error: signUpError.message };
  }

  if (signedUp.user && signedUp.user.identities?.length === 0) {
    return {
      error: "An account with this email already exists. Log in instead.",
    };
  }

  if (signedUp.session) {
    return { success: true as const, redirectTo: MEMBER_HOME_PATH };
  }

  return {
    needsEmailConfirmation: true as const,
    email,
    checkEmailPath: `${AUTH_CHECK_EMAIL_PATH}?email=${encodeURIComponent(email)}&account=member&brand=stockup`,
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

export async function resendMemberSignupConfirmationAction(
  email: string,
  turnstileToken?: string | null
) {
  return resendSignupVerificationAction(email, "member", turnstileToken);
}
