"use server";

import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/auth";
import {
  isUserAlreadyRegisteredError,
} from "@/lib/auth/account-roles";
import { setActivePortalCookie } from "@/lib/auth/active-portal";
import {
  getAuthUserIdentityProviders,
  userHasEmailPasswordIdentity,
  userHasGoogleIdentity,
} from "@/lib/auth/auth-user-identities";
import { enforceAuthBotProtection } from "@/lib/auth/bot-protection/enforce";
import {
  issueAndSendSignupVerification,
  AUTH_CHECK_EMAIL_PATH,
} from "@/lib/auth/email-verification";
import { enablePartnerProfileOnUser } from "@/lib/auth/enable-partner-profile";
import { findAuthUserByEmail } from "@/lib/auth/find-user-by-email";
import { supabaseAuthCaptchaOptions } from "@/lib/auth/supabase-captcha";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";
import { createClient } from "@/lib/supabase/server";

export async function createPartnerAccountAction(
  email: string,
  password: string,
  turnstileToken?: string | null
) {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { error: "Email address is required." };
  }

  const guard = await enforceAuthBotProtection({
    action: "email_verification",
    turnstileToken,
  });
  if (!guard.ok) {
    return { error: guard.error };
  }

  if (!isSupabaseConfigured()) {
    return { success: true as const };
  }

  try {
    const existingUser = await findAuthUserByEmail(trimmedEmail);
    if (existingUser) {
      const providers = await getAuthUserIdentityProviders(existingUser.id);
      return {
        needsExistingAccountLink: true as const,
        email: trimmedEmail,
        requiresGoogle:
          userHasGoogleIdentity(providers) &&
          !userHasEmailPasswordIdentity(providers),
      };
    }
  } catch (lookupError) {
    console.error("[signup] Partner email lookup failed", lookupError);
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
    if (isUserAlreadyRegisteredError(sendResult.error)) {
      try {
        const existingUser = await findAuthUserByEmail(trimmedEmail);
        if (existingUser) {
          const providers = await getAuthUserIdentityProviders(existingUser.id);
          return {
            needsExistingAccountLink: true as const,
            email: trimmedEmail,
            requiresGoogle:
              userHasGoogleIdentity(providers) &&
              !userHasEmailPasswordIdentity(providers),
          };
        }
      } catch (lookupError) {
        console.error("[signup] Partner duplicate email lookup failed", lookupError);
      }

      return {
        needsExistingAccountLink: true as const,
        email: trimmedEmail,
        requiresGoogle: false,
      };
    }

    console.error("[signup] Partner verification email failed", sendResult);
    return { error: sendResult.error };
  }

  return {
    needsEmailConfirmation: true as const,
    email: trimmedEmail,
    checkEmailPath: `${AUTH_CHECK_EMAIL_PATH}?email=${encodeURIComponent(trimmedEmail)}&account=partner`,
  };
}

export async function linkPartnerAccountWithPasswordAction(
  email: string,
  password: string,
  turnstileToken?: string | null
) {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { error: "Email address is required." };
  }

  if (!password) {
    return { error: "Password is required." };
  }

  const guard = await enforceAuthBotProtection({
    action: "login",
    turnstileToken,
  });
  if (!guard.ok) {
    return { error: guard.error };
  }

  if (!isSupabaseConfigured()) {
    return { success: true as const, redirectPath: PARTNER_APPLICATION_PATH };
  }

  let existingUser = null;
  try {
    existingUser = await findAuthUserByEmail(trimmedEmail);
  } catch (lookupError) {
    console.error("[signup] Partner link email lookup failed", lookupError);
  }

  if (existingUser) {
    const providers = await getAuthUserIdentityProviders(existingUser.id);
    if (
      userHasGoogleIdentity(providers) &&
      !userHasEmailPasswordIdentity(providers)
    ) {
      return {
        needsGoogleSignIn: true as const,
        error:
          "This account uses Google sign-in. Please use Sign in with Google to activate your Brand profile.",
      };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
    options: supabaseAuthCaptchaOptions(turnstileToken),
  });

  if (error || !data.user) {
    if (existingUser) {
      const providers = await getAuthUserIdentityProviders(existingUser.id);
      if (
        userHasGoogleIdentity(providers) &&
        !userHasEmailPasswordIdentity(providers)
      ) {
        return {
          needsGoogleSignIn: true as const,
          error:
            "This account uses Google sign-in. Please use Sign in with Google to activate your Brand profile.",
        };
      }
    }

    return {
      error: "Incorrect email or password. Please try again.",
    };
  }

  const enableResult = await enablePartnerProfileOnUser(supabase, data.user);
  if (enableResult.error) {
    console.error("[signup] Partner profile enable failed", enableResult.error);
    return {
      error:
        "Signed in successfully, but we could not activate your Brand profile. Please try again.",
    };
  }

  const cookieStore = await cookies();
  setActivePortalCookie(cookieStore, "partner");

  return {
    success: true as const,
    redirectPath: PARTNER_APPLICATION_PATH,
  };
}
