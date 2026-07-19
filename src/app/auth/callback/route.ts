import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { LOGIN_PATH, PARTNER_LOGIN_PATH } from "@/lib/auth";
import {
  ensureAuthenticatedSession,
  OAUTH_INTENT_COOKIE,
  parseOAuthCallbackContext,
  readOAuthIntentCookie,
  validateOAuthAccountType,
} from "@/lib/auth/complete-oauth-session";
import { clearOAuthIntentCookie } from "@/lib/auth/oauth-intent";

type PendingCookie = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const cookieStore = await cookies();
  const cookieIntent = readOAuthIntentCookie(
    cookieStore.get(OAUTH_INTENT_COOKIE)?.value
  );
  const context = parseOAuthCallbackContext(searchParams, cookieIntent);

  const loginPathForAccount =
    context.expectedAccountType === "partner"
      ? PARTNER_LOGIN_PATH
      : LOGIN_PATH;

  const pendingCookies: PendingCookie[] = [];

  function redirectTo(path: string) {
    const response = NextResponse.redirect(`${origin}${path}`);
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }
    response.cookies.set(OAUTH_INTENT_COOKIE, "", { maxAge: 0, path: "/" });
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
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            pendingCookies.push({ name, value, options });
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

  if (!validateOAuthAccountType(user, context.expectedAccountType)) {
    await supabase.auth.signOut();
    clearOAuthIntentCookie(cookieStore);
    return redirectTo(`${loginPathForAccount}?error=wrong_account_type`);
  }

  const { redirectPath, error: setupError } = await ensureAuthenticatedSession(
    supabase,
    user,
    context
  );

  clearOAuthIntentCookie(cookieStore);

  if (setupError) {
    console.error("[auth/callback] OAuth session setup failed", {
      userId: user.id,
      accountType: context.expectedAccountType,
      error: setupError,
    });
    await supabase.auth.signOut();
    return redirectTo(`${loginPathForAccount}?error=oauth_setup_failed`);
  }

  return redirectTo(redirectPath);
}
