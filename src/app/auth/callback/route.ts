import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getAccountTypeFromMetadata,
  LOGIN_PATH,
  MEMBER_DASHBOARD_PATH,
  PARTNER_DASHBOARD_PATH,
  PARTNER_LOGIN_PATH,
} from "@/lib/auth";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";
import { startMemberTrial } from "@/lib/member/start-trial";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const account = searchParams.get("account");
  const oauthError = searchParams.get("error");

  const loginPathForAccount =
    account === "partner" ? PARTNER_LOGIN_PATH : LOGIN_PATH;

  // The OAuth provider redirected back with an error (e.g. the user cancelled
  // the Google consent screen, or the provider rejected the request).
  if (oauthError) {
    const errorCode =
      oauthError === "access_denied" ? "oauth_cancelled" : "oauth_failed";
    return NextResponse.redirect(
      `${origin}${loginPathForAccount}?error=${errorCode}`
    );
  }

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${origin}${loginPathForAccount}?error=oauth_failed`
      );
    }

    {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const resolvedType = getAccountTypeFromMetadata(user?.user_metadata);
      const expectedType = account === "partner" ? "partner" : "member";

      if (resolvedType !== expectedType) {
        await supabase.auth.signOut();
        const loginPath =
          expectedType === "partner" ? PARTNER_LOGIN_PATH : LOGIN_PATH;
        return NextResponse.redirect(
          `${origin}${loginPath}?error=wrong_account_type`
        );
      }

      if (account === "partner") {
        await supabase.auth.updateUser({
          data: {
            account_type: "partner",
            partner_account_created: true,
          },
        });
      } else if (account === "member") {
        await supabase.auth.updateUser({
          data: { account_type: "member" },
        });

        if (next?.startsWith("/signup/welcome")) {
          const fullName =
            typeof user?.user_metadata?.full_name === "string"
              ? user.user_metadata.full_name
              : typeof user?.user_metadata?.name === "string"
                ? user.user_metadata.name
                : "";
          const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
          const firstName = nameParts[0] ?? "Member";
          const lastName = nameParts.slice(1).join(" ") || "Account";

          if (user?.id && user.email) {
            await startMemberTrial(supabase, {
              authUserId: user.id,
              email: user.email,
              firstName,
              lastName,
              country: "New Zealand",
              marketingOptIn: false,
            });
          }
        }
      }

      let redirectPath =
        next ?? (account === "partner" ? PARTNER_DASHBOARD_PATH : MEMBER_DASHBOARD_PATH);

      if (account === "partner" && user?.id) {
        const { data: partnerRow } = await supabase
          .from("partners")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        redirectPath = partnerRow
          ? next && next.startsWith("/")
            ? next
            : PARTNER_DASHBOARD_PATH
          : PARTNER_APPLICATION_PATH;
      }

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(
    `${origin}${loginPathForAccount}?error=oauth_failed`
  );
}
