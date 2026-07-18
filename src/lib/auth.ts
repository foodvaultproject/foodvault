import { createClient } from "@/lib/supabase/client";
import { storeOAuthIntentAction } from "@/lib/auth/oauth-intent-actions";
import { MEMBER_HOME_PATH } from "@/lib/member/paths";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

export const LOGIN_PATH = "/login";
export const PARTNER_LOGIN_PATH = "/partner-login";
export const SIGNUP_PATH = "/signup";
export const FORGOT_PASSWORD_PATH = "/forgot-password";
export const MEMBER_DASHBOARD_PATH = "/dashboard";
export const PARTNER_DASHBOARD_PATH = "/partner";
export const AFFILIATE_DASHBOARD_PATH = "/affiliate/dashboard";
export const AFFILIATE_LOGIN_PATH = "/affiliate/login";

const DEV_SESSION_KEY = "foodvault-dev-session";

export type AccountType = "member" | "partner" | "affiliate";

export type AuthSession = {
  id: string;
  email: string;
  accountType: AccountType;
  isDev?: boolean;
};

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function readDevSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(DEV_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function writeDevSession(session: AuthSession) {
  sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
}

export function createDevSession(email: string, accountType: AccountType) {
  writeDevSession({
    id: `dev-${email}`,
    email,
    accountType,
    isDev: true,
  });
}

export function getAccountTypeFromMetadata(
  metadata: Record<string, unknown> | undefined
): AccountType {
  if (metadata?.account_type === "partner") return "partner";
  if (metadata?.account_type === "affiliate") return "affiliate";
  return "member";
}

export function resolvePostLoginRedirect(
  accountType: AccountType,
  nextPath?: string | null
) {
  if (nextPath && nextPath.startsWith("/")) {
    return nextPath;
  }

  return accountType === "partner"
    ? PARTNER_DASHBOARD_PATH
    : accountType === "affiliate"
      ? AFFILIATE_DASHBOARD_PATH
      : MEMBER_DASHBOARD_PATH;
}

export async function getAuthSession(): Promise<AuthSession | null> {
  if (!isSupabaseConfigured()) {
    return readDevSession();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !user.email_confirmed_at) return null;

  return {
    id: user.id,
    email: user.email,
    accountType: getAccountTypeFromMetadata(user.user_metadata),
  };
}

const WRONG_ACCOUNT_MESSAGES: Record<AccountType, string> = {
  member:
    "This email is registered as a FoodVault Partner account. Please use Partner Login instead.",
  partner:
    "This email is registered as a FoodVault member account. Please use the member login page instead.",
  affiliate:
    "This email is registered with a different FoodVault account type. Please use the correct login page.",
};

export async function signInWithEmail(
  email: string,
  password: string,
  expectedAccountType: AccountType
): Promise<{ error?: string; accountType?: AccountType }> {
  if (!isSupabaseConfigured()) {
    writeDevSession({
      id: `dev-${email}`,
      email,
      accountType: expectedAccountType,
      isDev: true,
    });
    return { accountType: expectedAccountType };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const resolvedType = getAccountTypeFromMetadata(data.user?.user_metadata);

  if (resolvedType !== expectedAccountType) {
    await supabase.auth.signOut();
    return { error: WRONG_ACCOUNT_MESSAGES[expectedAccountType] };
  }

  return { accountType: resolvedType };
}

export async function signInWithGoogle(options: {
  accountType: AccountType;
  nextPath?: string;
  signupMode?: "trial" | "membership";
  marketingOptIn?: boolean;
  flow?: "signup" | "login";
}) {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Google sign-in is not configured yet. Use your email and password instead.",
    };
  }

  const flow = options.flow ?? "login";
  const defaultNext =
    options.accountType === "partner"
      ? flow === "signup"
        ? PARTNER_APPLICATION_PATH
        : PARTNER_DASHBOARD_PATH
      : options.accountType === "affiliate"
        ? AFFILIATE_DASHBOARD_PATH
        : flow === "signup"
          ? MEMBER_HOME_PATH
          : MEMBER_DASHBOARD_PATH;
  const next = options.nextPath ?? defaultNext;

  await storeOAuthIntentAction({
    accountType: options.accountType,
    nextPath: next,
    signupMode: options.signupMode,
    marketingOptIn: options.marketingOptIn,
    flow,
  });

  const callbackParams = new URLSearchParams({
    next,
    account: options.accountType,
  });

  if (options.signupMode) {
    callbackParams.set("signup_mode", options.signupMode);
  }

  if (options.marketingOptIn !== undefined) {
    callbackParams.set("marketing_opt_in", options.marketingOptIn ? "1" : "0");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?${callbackParams.toString()}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function signOut() {
  if (typeof window !== "undefined") {
    const partnerId = sessionStorage.getItem("fv-active-partner-id");
    if (partnerId) {
      localStorage.setItem(`fv-listing-live-dismissed:${partnerId}`, "1");
      sessionStorage.removeItem("fv-active-partner-id");
    }
  }

  if (!isSupabaseConfigured()) {
    sessionStorage.removeItem(DEV_SESSION_KEY);
    return;
  }

  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function resetPassword(
  email: string,
  returnPath: string = LOGIN_PATH
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Password reset is not configured yet. Contact support@foodvault.co.nz for help.",
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${returnPath}`,
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}
