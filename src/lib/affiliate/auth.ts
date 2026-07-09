import { createClient } from "@/lib/supabase/client";
import {
  createDevSession,
  getAuthSession,
  isSupabaseConfigured,
  signInWithEmail,
  type AuthSession,
} from "@/lib/auth";
import { registerAffiliateProfile } from "@/lib/affiliate/data";
import type { AffiliateRegistrationInput } from "@/lib/affiliate/types";
import { AFFILIATE_DASHBOARD_PATH } from "@/lib/affiliate/paths";

const DEV_AFFILIATE_PREFIX = "foodvault-affiliate-record";

function getDevAffiliateKey(userId: string) {
  return `${DEV_AFFILIATE_PREFIX}:${userId}`;
}

function readDevAffiliate(userId: string) {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(getDevAffiliateKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeDevAffiliate(userId: string, record: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getDevAffiliateKey(userId), JSON.stringify(record));
}

export async function getAffiliateSession(): Promise<AuthSession | null> {
  const session = await getAuthSession();
  if (!session || session.accountType !== "affiliate") {
    return null;
  }
  return session;
}

export async function isAffiliateAccount(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return readDevAffiliate(userId) !== null;
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("affiliates")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data);
}

export async function createAffiliateAccount(
  input: AffiliateRegistrationInput
): Promise<{ error?: string }> {
  if (!input.firstName.trim() || !input.lastName.trim()) {
    return { error: "First name and last name are required." };
  }

  if (!input.email.trim()) {
    return { error: "Email address is required." };
  }

  if (!isSupabaseConfigured()) {
    createDevSession(input.email.trim(), "affiliate");
    writeDevAffiliate(`dev-${input.email.trim()}`, {
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email: input.email.trim(),
      referral_code: "DEVAFF01",
    });
    return {};
  }

  const supabase = createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        account_type: "affiliate",
        affiliate_account_created: true,
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        capabilities: ["affiliate"],
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  if (!signUpData.user) {
    return { error: "Unable to create affiliate account." };
  }

  if (!signUpData.session) {
    const signIn = await signInWithEmail(
      input.email.trim(),
      input.password,
      "affiliate"
    );
    if (signIn.error) {
      return {
        error:
          "Account created. Please confirm your email, then sign in to finish setup.",
      };
    }
  }

  try {
    await registerAffiliateProfile({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      country: input.country,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Account created but affiliate profile setup failed.",
    };
  }

  return {};
}

export async function signInAffiliateWithEmail(
  email: string,
  password: string
): Promise<{ error?: string }> {
  const result = await signInWithEmail(email.trim(), password, "affiliate");
  if (result.error) {
    return { error: result.error };
  }
  return {};
}

export function resolveAffiliatePostLoginPath(nextPath?: string | null) {
  if (nextPath && nextPath.startsWith("/")) {
    return nextPath;
  }
  return AFFILIATE_DASHBOARD_PATH;
}
