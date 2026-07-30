import type { SupabaseClient, User } from "@supabase/supabase-js";
import { PARTNER_DASHBOARD_PATH } from "@/lib/auth";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback = ""
) {
  const value = metadata[key];
  return typeof value === "string" ? value.trim() : fallback;
}

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

/** Partner Google OAuth must never start a member trial — only set partner metadata. */
export async function ensurePartnerOAuthSession(
  supabase: SupabaseClient,
  user: User,
  nextPath?: string | null
): Promise<{ redirectPath: string; error?: string }> {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  const { error } = await supabase.auth.updateUser({
    data: {
      account_type: "partner",
      partner_account_created: true,
      onboarding_step:
        typeof metadata.onboarding_step === "number" ? metadata.onboarding_step : 2,
      signup_completed_at:
        readMetadataString(metadata, "signup_completed_at") ||
        new Date().toISOString(),
    },
  });

  if (error) {
    return {
      redirectPath: PARTNER_APPLICATION_PATH,
      error: error.message,
    };
  }

  return {
    redirectPath: await resolvePartnerRedirect(supabase, user.id, nextPath),
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
