import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { LOGIN_PATH, PARTNER_LOGIN_PATH } from "@/lib/auth";
import {
  completeOAuthSession,
  parseOAuthCallbackContext,
  validateOAuthAccountType,
} from "@/lib/auth/complete-oauth-session";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const context = parseOAuthCallbackContext(searchParams);

  const loginPathForAccount =
    context.expectedAccountType === "partner"
      ? PARTNER_LOGIN_PATH
      : LOGIN_PATH;

  if (oauthError) {
    const errorCode =
      oauthError === "access_denied" ? "oauth_cancelled" : "oauth_failed";
    return NextResponse.redirect(
      `${origin}${loginPathForAccount}?error=${errorCode}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}${loginPathForAccount}?error=oauth_failed`
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}${loginPathForAccount}?error=oauth_failed`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}${loginPathForAccount}?error=oauth_failed`
    );
  }

  if (!validateOAuthAccountType(user, context.expectedAccountType)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}${loginPathForAccount}?error=wrong_account_type`
    );
  }

  const { redirectPath, error: setupError } = await completeOAuthSession(
    supabase,
    user,
    context
  );

  if (setupError) {
    console.error("[auth/callback] OAuth session setup failed", {
      userId: user.id,
      accountType: context.expectedAccountType,
      error: setupError,
    });
    return NextResponse.redirect(
      `${origin}${loginPathForAccount}?error=oauth_setup_failed`
    );
  }

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
