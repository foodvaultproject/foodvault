"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured, SIGNUP_PATH } from "@/lib/auth";
import { sendMemberSignupEmails } from "@/lib/email-templates/dispatch";
import { createClient } from "@/lib/supabase/server";
import {
  SIGNUP_MEMBERSHIP_PATH,
  SIGNUP_WELCOME_PATH,
} from "@/lib/member/paths";
import {
  syncMemberProfileFromAuth,
  upsertMemberSignupProfile,
} from "@/lib/member/upsert-signup-profile";
import { startMemberTrial } from "@/lib/member/start-trial";

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

  const supabase = await createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email.trim(),
    password: data.password,
    options: {
      data: {
        account_type: "member",
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
      },
    },
  });

  if (signUpError) {
    if (signUpError.message.toLowerCase().includes("already registered")) {
      return { error: "This email is already registered. Please log in instead." };
    }
    return { error: signUpError.message };
  }

  if (!signUpData.user) {
    return { error: "Unable to create account." };
  }

  if (mode === "trial") {
    const { error: trialError } = await startMemberTrial(supabase, {
      authUserId: signUpData.user.id,
      email: signUpData.user.email ?? data.email.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      country: data.country,
      marketingOptIn: data.marketingOptIn,
    });

    if (trialError) {
      return { error: trialError };
    }
  } else {
    await supabase.auth.updateUser({
      data: { account_type: "member" },
    });

    const { error: profileError } = await upsertMemberSignupProfile(supabase, {
      authUserId: signUpData.user.id,
      email: signUpData.user.email ?? data.email.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      country: data.country,
      marketingOptIn: data.marketingOptIn,
    });

    if (profileError) {
      return { error: profileError };
    }
  }

  void sendMemberSignupEmails({
    to: signUpData.user.email ?? data.email.trim(),
    firstName: data.firstName.trim(),
    mode,
  }).catch((emailError) => {
    console.error("[signup] Failed to send member signup emails", {
      email: data.email.trim(),
      error: emailError instanceof Error ? emailError.message : emailError,
    });
  });

  return {
    success: true as const,
    redirectTo: mode === "trial" ? SIGNUP_WELCOME_PATH : SIGNUP_MEMBERSHIP_PATH,
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

  return { id: user.id, email: user.email };
}
