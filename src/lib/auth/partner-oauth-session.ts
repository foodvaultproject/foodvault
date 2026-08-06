import type { SupabaseClient, User } from "@supabase/supabase-js";
import { PARTNER_DASHBOARD_PATH } from "@/lib/auth";
import { enablePartnerProfileOnUser } from "@/lib/auth/enable-partner-profile";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

async function resolvePartnerRedirect(
  supabase: SupabaseClient,
  userId: string,
  nextPath?: string | null
): Promise<string> {
  if (nextPath?.startsWith("/")) {
    return nextPath;
  }

  const { data: partnerRow } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  return partnerRow ? PARTNER_DASHBOARD_PATH : PARTNER_APPLICATION_PATH;
}

/** Partner Google OAuth — enable partner access without removing member primary type. */
export async function ensurePartnerOAuthSession(
  supabase: SupabaseClient,
  user: User,
  nextPath?: string | null
): Promise<{ redirectPath: string; error?: string }> {
  const enableResult = await enablePartnerProfileOnUser(supabase, user);

  if (enableResult.error) {
    return {
      redirectPath: PARTNER_APPLICATION_PATH,
      error: enableResult.error,
    };
  }

  return {
    redirectPath: await resolvePartnerRedirect(
      supabase,
      enableResult.user.id,
      nextPath
    ),
  };
}

export function readPartnerIntentFromCookieValue(
  cookieValue: string | undefined
): boolean {
  if (!cookieValue) {
    return false;
  }

  try {
    const decoded = cookieValue.startsWith("%7B")
      ? decodeURIComponent(cookieValue)
      : cookieValue;
    const parsed = JSON.parse(decoded) as { accountType?: string };
    return parsed.accountType === "partner";
  } catch {
    return false;
  }
}

export function requestHasPartnerOAuthIntent(
  getCookie: (name: string) => string | undefined
): boolean {
  return (
    readPartnerIntentFromCookieValue(getCookie("fv-oauth-intent-client")) ||
    readPartnerIntentFromCookieValue(getCookie("fv-oauth-intent"))
  );
}
