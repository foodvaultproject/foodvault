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
import { ensureAuthenticatedSession } from "@/lib/auth/session-completion";
import {
  AUTH_CHECK_EMAIL_PATH,
  stockupSessionHandoffUrl,
  type AuthConfirmLinkType,
} from "@/lib/auth/email-verification";
import {
  AFFILIATE_LOGIN_PATH,
  getAccountTypeFromMetadata,
  LOGIN_PATH,
  PARTNER_LOGIN_PATH,
  RESET_PASSWORD_PATH,
} from "@/lib/auth";

function loginPathForAccount(account: string | null) {
  if (account === "partner") return PARTNER_LOGIN_PATH;
  if (account === "affiliate") return AFFILIATE_LOGIN_PATH;
  return LOGIN_PATH;
}

function isAuthConfirmLinkType(value: string | null): value is AuthConfirmLinkType {
  return value === "signup" || value === "invite" || value === "magiclink" || value === "recovery";
}

export async function GET(request: Request) {
  const bounce = stockupLinkBounce(request);
  if (bounce) {
    return NextResponse.redirect(bounce);
  }

  const { searchParams } = new URL(request.url);
  const origin = requestSiteOrigin(request);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");
  const account = searchParams.get("account");
  const loginPath = loginPathForAccount(account);

  if (!tokenHash || !isAuthConfirmLinkType(type)) {
    return NextResponse.redirect(
      `${origin}${loginPath}?error=verification_invalid`
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

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (verifyError) {
    if (type === "recovery") {
      return NextResponse.redirect(
        `${origin}/forgot-password?error=reset_link_invalid`
      );
    }

    const checkEmailUrl = new URL(`${origin}${AUTH_CHECK_EMAIL_PATH}`);
    if (account) {
      checkEmailUrl.searchParams.set("account", account);
    }
    checkEmailUrl.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(checkEmailUrl.toString());
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(
      `${origin}${loginPath}?error=verification_failed`
    );
  }

  if (type === "recovery") {
    const resetPath =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : RESET_PASSWORD_PATH;

    return NextResponse.redirect(`${origin}${resetPath}`);
  }

  const resolvedAccountType = getAccountTypeFromMetadata(user.user_metadata);
  if (account && account !== resolvedAccountType) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}${loginPathForAccount(account)}?error=wrong_account_type`
    );
  }

  const signupMode =
    typeof user.user_metadata?.signup_mode === "string"
      ? user.user_metadata.signup_mode
      : "";
  const stockupAccount = signupMode === "stockup" || searchParams.get("brand") === "stockup";
  const landedOnStockUp = getAppMode(requestHost(request)) === "stockup";

  if (stockupAccount && !landedOnStockUp && searchParams.get("handoff") !== "1") {
    const handoff = await stockupSessionHandoffUrl(user.email);
    if (handoff) {
      return NextResponse.redirect(handoff);
    }
    return NextResponse.redirect(`${STOCKUP_ORIGIN}/`);
  }

  const completion = await ensureAuthenticatedSession(supabase, user, {
    expectedAccountType: resolvedAccountType,
    nextPath: stockupAccount ? stockupSafePath(next) : next,
  });
  if (completion.error) {
    const checkEmailUrl = new URL(
      `${stockupAccount ? STOCKUP_ORIGIN : origin}${AUTH_CHECK_EMAIL_PATH}`
    );
    checkEmailUrl.searchParams.set("account", resolvedAccountType);
    checkEmailUrl.searchParams.set("email", user.email);
    checkEmailUrl.searchParams.set("error", "verification_setup_failed");
    if (stockupAccount) {
      checkEmailUrl.searchParams.set("brand", "stockup");
    }
    return NextResponse.redirect(checkEmailUrl.toString());
  }

  const redirectPath = stockupAccount
    ? stockupSafePath(completion.redirectPath)
    : completion.redirectPath;
  const redirectOrigin = stockupAccount ? STOCKUP_ORIGIN : origin;
  return NextResponse.redirect(`${redirectOrigin}${redirectPath}`);
}
