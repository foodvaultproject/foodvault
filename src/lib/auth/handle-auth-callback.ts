import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getAppMode,
  requestHost,
  requestSiteOrigin,
  STOCKUP_ORIGIN,
  stockupLinkBounce,
  stockupSafePath,
} from "@/lib/app-mode";
import type { AccountType } from "@/lib/auth";
import { stockupSessionHandoffUrl } from "@/lib/auth/email-verification";
import { LOGIN_PATH, PARTNER_LOGIN_PATH } from "@/lib/auth";
import { setActivePortalCookie } from "@/lib/auth/active-portal";
import {
  ensureAuthenticatedSession,
  OAUTH_INTENT_COOKIE,
  OAUTH_INTENT_CLIENT_COOKIE,
  parseOAuthCallbackContext,
  readOAuthIntentFromRequestCookies,
  validateOAuthAccountType,
} from "@/lib/auth/complete-oauth-session";
import { clearOAuthIntentCookie } from "@/lib/auth/oauth-intent";
import { ensurePartnerOAuthSession } from "@/lib/auth/partner-oauth-session";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

type PendingCookie = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

type HandleAuthCallbackOptions = {
  forcedAccountType?: AccountType;
  defaultNextPath?: string;
};

export async function handleAuthCallback(
  request: Request,
  options: HandleAuthCallbackOptions = {}
) {
  const bounce = stockupLinkBounce(request);
  if (bounce) {
    return NextResponse.redirect(bounce);
  }

  const { searchParams } = new URL(request.url);
  const origin = requestSiteOrigin(request);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const cookieStore = await cookies();
  const cookieIntent = readOAuthIntentFromRequestCookies((name) =>
    cookieStore.get(name)?.value
  );
  let context = parseOAuthCallbackContext(searchParams, cookieIntent);

  if (options.forcedAccountType) {
    context = {
      ...context,
      expectedAccountType: options.forcedAccountType,
      nextPath:
        context.nextPath ??
        searchParams.get("next") ??
        cookieIntent?.nextPath ??
        options.defaultNextPath ??
        null,
    };
  }

  const loginPathForAccount =
    context.expectedAccountType === "partner"
      ? PARTNER_LOGIN_PATH
      : LOGIN_PATH;

  const pendingCookies: PendingCookie[] = [];

  function redirectTo(path: string, siteOrigin = origin) {
    const completeUrl = `/auth/complete?next=${encodeURIComponent(path)}`;
    const response = NextResponse.redirect(`${siteOrigin}${completeUrl}`);
    for (const { name, value, options: cookieOptions } of pendingCookies) {
      response.cookies.set(name, value, cookieOptions);
    }
    response.cookies.set(OAUTH_INTENT_COOKIE, "", { maxAge: 0, path: "/" });
    response.cookies.set(OAUTH_INTENT_CLIENT_COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  }

  if (oauthError) {
    clearOAuthIntentCookie(cookieStore);
    const errorCode =
      oauthError === "access_denied" ? "oauth_cancelled" : "oauth_failed";
    return redirectTo(`${loginPathForAccount}?error=${errorCode}`);
  }

  if (!code) {
    clearOAuthIntentCookie(cookieStore);
    return redirectTo(`${loginPathForAccount}?error=oauth_failed`);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
            cookieStore.set(name, value, cookieOptions);
            pendingCookies.push({ name, value, options: cookieOptions });
          });
        },
      },
    }
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    clearOAuthIntentCookie(cookieStore);
    return redirectTo(`${loginPathForAccount}?error=oauth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    clearOAuthIntentCookie(cookieStore);
    return redirectTo(`${loginPathForAccount}?error=oauth_failed`);
  }

  const signupMode =
    typeof user.user_metadata?.signup_mode === "string"
      ? user.user_metadata.signup_mode
      : "";
  if (
    signupMode === "stockup" &&
    user.email &&
    getAppMode(requestHost(request)) !== "stockup"
  ) {
    const handoff = await stockupSessionHandoffUrl(user.email);
    clearOAuthIntentCookie(cookieStore);
    if (handoff) {
      return NextResponse.redirect(handoff);
    }
    return NextResponse.redirect(`${STOCKUP_ORIGIN}/`);
  }

  if (!validateOAuthAccountType(user, context.expectedAccountType)) {
    await supabase.auth.signOut();
    clearOAuthIntentCookie(cookieStore);
    return redirectTo(`${loginPathForAccount}?error=wrong_account_type`);
  }

  if (options.forcedAccountType === "partner") {
    const { redirectPath, error: setupError } = await ensurePartnerOAuthSession(
      supabase,
      user,
      context.nextPath
    );

    clearOAuthIntentCookie(cookieStore);
    setActivePortalCookie(cookieStore, "partner");

    if (setupError) {
      console.error("[auth/callback/partner] Partner OAuth setup failed", {
        userId: user.id,
        error: setupError,
      });
      await supabase.auth.signOut();
      return redirectTo(`${PARTNER_LOGIN_PATH}?error=oauth_setup_failed`);
    }

    return redirectTo(redirectPath);
  }

  const { redirectPath, error: setupError } = await ensureAuthenticatedSession(
    supabase,
    user,
    context
  );

  clearOAuthIntentCookie(cookieStore);

  const stockupAccount =
    signupMode === "stockup" || searchParams.get("brand") === "stockup";

  if (setupError && !stockupAccount) {
    console.error("[auth/callback] OAuth session setup failed", {
      userId: user.id,
      accountType: context.expectedAccountType,
      error: setupError,
    });
    await supabase.auth.signOut();
    return redirectTo(`${loginPathForAccount}?error=oauth_setup_failed`);
  }

  if (setupError) {
    console.error("[auth/callback] StockUp profile setup failed", {
      userId: user.id,
      error: setupError,
    });
  }

  return redirectTo(
    stockupAccount ? stockupSafePath(redirectPath) : redirectPath,
    stockupAccount ? STOCKUP_ORIGIN : origin
  );
}

export const PARTNER_OAUTH_CALLBACK_PATH = "/auth/callback/partner";
export const DEFAULT_PARTNER_OAUTH_NEXT_PATH = PARTNER_APPLICATION_PATH;
