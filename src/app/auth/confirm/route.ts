import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureAuthenticatedSession } from "@/lib/auth/session-completion";
import {
  AUTH_CHECK_EMAIL_PATH,
  type VerificationLinkType,
} from "@/lib/auth/email-verification";
import {
  AFFILIATE_LOGIN_PATH,
  getAccountTypeFromMetadata,
  LOGIN_PATH,
  PARTNER_LOGIN_PATH,
} from "@/lib/auth";

function loginPathForAccount(account: string | null) {
  if (account === "partner") return PARTNER_LOGIN_PATH;
  if (account === "affiliate") return AFFILIATE_LOGIN_PATH;
  return LOGIN_PATH;
}

function isVerificationLinkType(value: string | null): value is VerificationLinkType {
  return value === "signup" || value === "invite";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");
  const account = searchParams.get("account");
  const loginPath = loginPathForAccount(account);

  if (!tokenHash || !isVerificationLinkType(type)) {
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

  const resolvedAccountType = getAccountTypeFromMetadata(user.user_metadata);
  if (account && account !== resolvedAccountType) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}${loginPathForAccount(account)}?error=wrong_account_type`
    );
  }

  const completion = await ensureAuthenticatedSession(supabase, user, {
    expectedAccountType: resolvedAccountType,
    nextPath: next,
  });
  if (completion.error) {
    const checkEmailUrl = new URL(`${origin}${AUTH_CHECK_EMAIL_PATH}`);
    checkEmailUrl.searchParams.set("account", resolvedAccountType);
    checkEmailUrl.searchParams.set("email", user.email);
    checkEmailUrl.searchParams.set("error", "verification_setup_failed");
    return NextResponse.redirect(checkEmailUrl.toString());
  }

  return NextResponse.redirect(`${origin}${completion.redirectPath}`);
}
