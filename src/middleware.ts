import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { crossDomainRedirect, getAppMode, legacyLocalRedirect } from "@/lib/app-mode";
import { AUTH_CHECK_EMAIL_PATH } from "@/lib/auth/email-verification";
import { requestHasPartnerOAuthIntent } from "@/lib/auth/partner-oauth-session";
import { pathAllowsUnverifiedAccess } from "@/lib/auth/unverified-access";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const mode = getAppMode(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  );
  if (pathname === "/favicon.ico" && mode === "stockup") {
    const iconUrl = request.nextUrl.clone();
    iconUrl.pathname = "/Favicon/favicon_stockup.png";
    return NextResponse.rewrite(iconUrl);
  }

  // Mode-exclusive public pages and admin sections go to the other domain.
  const crossDomain = crossDomainRedirect(mode, pathname, request.nextUrl.search);
  if (crossDomain) {
    return NextResponse.redirect(crossDomain, 307);
  }

  const localRedirect = legacyLocalRedirect(mode, pathname);
  if (localRedirect) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = localRedirect;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl, 307);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const oauthCode = request.nextUrl.searchParams.get("code");
  if (
    oauthCode &&
    !pathname.startsWith("/auth/callback") &&
    requestHasPartnerOAuthIntent((name) => request.cookies.get(name)?.value)
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/callback/partner";
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/partner") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/partner/listing";
    return NextResponse.redirect(redirectUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email && !user.email_confirmed_at) {
    if (!pathAllowsUnverifiedAccess(pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = AUTH_CHECK_EMAIL_PATH;
      redirectUrl.searchParams.set("email", user.email);
      redirectUrl.searchParams.set(
        "account",
        typeof user.user_metadata?.account_type === "string"
          ? user.user_metadata.account_type
          : "member"
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
