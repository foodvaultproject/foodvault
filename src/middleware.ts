import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_CHECK_EMAIL_PATH } from "@/lib/auth/email-verification";
import { pathAllowsUnverifiedAccess } from "@/lib/auth/unverified-access";

export async function middleware(request: NextRequest) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email && !user.email_confirmed_at) {
    const pathname = request.nextUrl.pathname;
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
