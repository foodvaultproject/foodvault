import { authEmailCandidates } from "@/lib/auth/email-aliases";
import { createClient } from "@/lib/supabase/client";
import {
  getAvailableRoles,
  hasMemberAccess,
  hasPartnerAccess,
  resolveActiveAccountType,
} from "@/lib/auth/account-roles";
import { readActivePortalClient, setActivePortalClient } from "@/lib/auth/active-portal";
import {
  authHintFromAccountType,
  clearSessionHintsClient,
  setSessionHintsClient,
  syncSessionHintsFromSession,
} from "@/lib/auth/session-hint";
import { supabaseAuthCaptchaOptions } from "@/lib/auth/supabase-captcha";
import { storeOAuthIntentAction } from "@/lib/auth/oauth-intent-actions";
import {
  markPartnerOAuthSignup,
  storeOAuthIntentClient,
} from "@/lib/auth/oauth-intent-client";

const PARTNER_OAUTH_CALLBACK_PATH = "/auth/callback/partner";
import { MEMBER_HOME_PATH, SIGNUP_MEMBERSHIP_PATH } from "@/lib/member/paths";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

export const LOGIN_PATH = "/login";
export const PARTNER_LOGIN_PATH = "/partner-login";
export const SIGNUP_PATH = "/signup";
export const FORGOT_PASSWORD_PATH = "/forgot-password";
export const RESET_PASSWORD_PATH = "/reset-password";
export const MEMBER_DASHBOARD_PATH = "/dashboard";
export const PARTNER_DASHBOARD_PATH = "/partner/listing";
export const AFFILIATE_DASHBOARD_PATH = "/affiliate/dashboard";
export const AFFILIATE_LOGIN_PATH = "/affiliate/login";

const DEV_SESSION_KEY = "foodvault-dev-session";

export type AccountType = "member" | "partner" | "affiliate";

export type AuthSession = {
  id: string;
  email: string;
  accountType: AccountType;
  roles: AccountType[];
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
  syncSessionHintsFromSession(session);
}

export function createDevSession(email: string, accountType: AccountType) {
  writeDevSession({
    id: `dev-${email}`,
    email,
    accountType,
    roles: [accountType],
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
      : MEMBER_HOME_PATH;
}

export async function getAuthSession(): Promise<AuthSession | null> {
  if (!isSupabaseConfigured()) {
    return readDevSession();
  }

  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (error || !user?.email || !user.email_confirmed_at) return null;

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const roles = getAvailableRoles(metadata);
  const accountType = resolveActiveAccountType(
    metadata,
    readActivePortalClient()
  );

  return {
    id: user.id,
    email: user.email,
    accountType,
    roles,
  };
}

export function syncAuthSessionHints(
  session: AuthSession | null,
  membership?: { isActiveMember: boolean }
) {
  syncSessionHintsFromSession(session, membership);
}

const WRONG_ACCOUNT_MESSAGES: Record<AccountType, string> = {
  member:
    "This email is registered as a FoodVault Partner account. Please use Business Login instead.",
  partner:
    "This email is not registered for Partner access. Create a Brand profile or use the member login page.",
  affiliate:
    "This email is registered with a different FoodVault account type. Please use the correct login page.",
};

export async function signInWithEmail(
  email: string,
  password: string,
  expectedAccountType: AccountType,
  captchaToken?: string | null
): Promise<{ error?: string; accountType?: AccountType }> {
  if (!isSupabaseConfigured()) {
    writeDevSession({
      id: `dev-${email}`,
      email,
      accountType: expectedAccountType,
      roles: [expectedAccountType],
      isDev: true,
    });
    return { accountType: expectedAccountType };
  }

  const supabase = createClient();
  const loginEmail = authEmailCandidates(email).at(-1) ?? email.trim();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
    options: supabaseAuthCaptchaOptions(captchaToken),
  });

  if (error) {
    return { error: error.message };
  }

  const metadata = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
  const primaryType = getAccountTypeFromMetadata(metadata);

  if (expectedAccountType === "partner") {
    if (!hasPartnerAccess(metadata)) {
      await supabase.auth.signOut();
      return { error: WRONG_ACCOUNT_MESSAGES.partner };
    }
    setActivePortalClient("partner");
    setSessionHintsClient({ auth: "partner" });
    return { accountType: "partner" };
  }

  if (expectedAccountType === "member") {
    if (primaryType === "partner" && !hasMemberAccess(metadata)) {
      await supabase.auth.signOut();
      return { error: WRONG_ACCOUNT_MESSAGES.member };
    }
    if (primaryType === "affiliate") {
      await supabase.auth.signOut();
      return { error: WRONG_ACCOUNT_MESSAGES.member };
    }
    setActivePortalClient("member");
    setSessionHintsClient({ auth: "member" });
    return { accountType: "member" };
  }

  if (primaryType !== expectedAccountType) {
    await supabase.auth.signOut();
    return { error: WRONG_ACCOUNT_MESSAGES[expectedAccountType] };
  }

  setSessionHintsClient({ auth: authHintFromAccountType(primaryType) });
  return { accountType: primaryType };
}

export async function signInWithGoogle(options: {
  accountType: AccountType;
  nextPath?: string;
  signupMode?: "membership";
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
          ? SIGNUP_MEMBERSHIP_PATH
          : MEMBER_HOME_PATH;
  const next = options.nextPath ?? defaultNext;

  await storeOAuthIntentAction({
    accountType: options.accountType,
    nextPath: next,
    signupMode: options.signupMode,
    marketingOptIn: options.marketingOptIn,
    flow,
  });

  const intent = {
    accountType: options.accountType,
    nextPath: next,
    signupMode: options.signupMode,
    marketingOptIn: options.marketingOptIn,
    flow,
  } as const;

  storeOAuthIntentClient(intent);

  if (options.accountType === "partner" && flow === "signup") {
    markPartnerOAuthSignup();
  }

  const callbackPath =
    options.accountType === "partner"
      ? PARTNER_OAUTH_CALLBACK_PATH
      : "/auth/callback";

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${callbackPath}`,
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
    clearSessionHintsClient();
    setSessionHintsClient({ auth: "guest", membership: "none" });
    return;
  }

  clearSessionHintsClient();
  setSessionHintsClient({ auth: "guest", membership: "none" });

  const supabase = createClient();
  await supabase.auth.signOut();
}

/** Sign out and hard-navigate home so SSR membership/partner UI refreshes. */
export async function signOutAndGoHome() {
  await signOut();
  if (typeof window !== "undefined") {
    window.location.assign("/");
  }
}
