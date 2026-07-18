import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  type AccountType,
  getAccountTypeFromMetadata,
  PARTNER_DASHBOARD_PATH,
  resolvePostLoginRedirect,
} from "@/lib/auth";
import { completeSignupVerification } from "@/lib/auth/complete-verification";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback = ""
) {
  const value = metadata[key];
  return typeof value === "string" ? value.trim() : fallback;
}

export function parseOAuthDisplayName(metadata: Record<string, unknown>) {
  const fullName =
    readMetadataString(metadata, "full_name") ||
    readMetadataString(metadata, "name");
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  return {
    firstName: nameParts[0] ?? "Member",
    lastName: nameParts.slice(1).join(" ") || "Account",
  };
}

/** Only block OAuth when an established account uses the wrong portal. */
export function validateOAuthAccountType(
  user: User,
  expectedType: AccountType
): boolean {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const signupCompletedAt = readMetadataString(metadata, "signup_completed_at");

  if (!signupCompletedAt) {
    return true;
  }

  return getAccountTypeFromMetadata(metadata) === expectedType;
}

export type OAuthSessionContext = {
  expectedAccountType: AccountType;
  nextPath?: string | null;
  signupMode?: "trial" | "membership";
  marketingOptIn?: boolean;
};

export function parseOAuthCallbackContext(searchParams: URLSearchParams): {
  expectedAccountType: AccountType;
  nextPath: string | null;
  signupMode?: "trial" | "membership";
  marketingOptIn?: boolean;
} {
  const account = searchParams.get("account");
  const expectedAccountType: AccountType =
    account === "partner"
      ? "partner"
      : account === "affiliate"
        ? "affiliate"
        : "member";

  const signupModeParam = searchParams.get("signup_mode");
  const signupMode =
    signupModeParam === "membership" || signupModeParam === "trial"
      ? signupModeParam
      : undefined;

  const marketingParam = searchParams.get("marketing_opt_in");
  const marketingOptIn =
    marketingParam === "1"
      ? true
      : marketingParam === "0"
        ? false
        : undefined;

  return {
    expectedAccountType,
    nextPath: searchParams.get("next"),
    signupMode,
    marketingOptIn,
  };
}

async function prepareOAuthUserMetadata(
  supabase: SupabaseClient,
  user: User,
  context: OAuthSessionContext
): Promise<User> {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  if (readMetadataString(metadata, "signup_completed_at")) {
    return user;
  }

  const updates: Record<string, unknown> = {
    account_type: context.expectedAccountType,
  };

  if (!readMetadataString(metadata, "first_name")) {
    const { firstName, lastName } = parseOAuthDisplayName(metadata);
    updates.first_name = firstName;
    updates.last_name = lastName;
  }

  if (context.expectedAccountType === "member") {
    if (!readMetadataString(metadata, "signup_mode")) {
      updates.signup_mode = context.signupMode ?? "trial";
    }
    if (!readMetadataString(metadata, "country")) {
      updates.country = "New Zealand";
    }
    if (
      metadata.marketing_opt_in === undefined &&
      context.marketingOptIn !== undefined
    ) {
      updates.marketing_opt_in = context.marketingOptIn;
    }
  }

  if (context.expectedAccountType === "partner") {
    updates.partner_account_created = true;
    if (metadata.onboarding_step === undefined) {
      updates.onboarding_step = 2;
    }
  }

  const { error } = await supabase.auth.updateUser({ data: updates });
  if (error) {
    console.error("[auth/callback] Failed to prepare OAuth metadata", error);
    return user;
  }

  const {
    data: { user: refreshed },
  } = await supabase.auth.getUser();

  return refreshed ?? user;
}

async function resolvePartnerRedirect(
  supabase: SupabaseClient,
  userId: string,
  nextPath: string | null | undefined
): Promise<string> {
  const { data: partnerRow } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!partnerRow) {
    return PARTNER_APPLICATION_PATH;
  }

  if (nextPath && nextPath.startsWith("/")) {
    return nextPath;
  }

  return PARTNER_DASHBOARD_PATH;
}

export async function completeOAuthSession(
  supabase: SupabaseClient,
  user: User,
  context: OAuthSessionContext
): Promise<{ redirectPath: string; error?: string }> {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const wasReturningUser = Boolean(
    readMetadataString(metadata, "signup_completed_at")
  );

  if (wasReturningUser) {
    if (context.expectedAccountType === "partner" && user.id) {
      return {
        redirectPath: await resolvePartnerRedirect(
          supabase,
          user.id,
          context.nextPath
        ),
      };
    }

    return {
      redirectPath: resolvePostLoginRedirect(
        context.expectedAccountType,
        context.nextPath
      ),
    };
  }

  const preparedUser = await prepareOAuthUserMetadata(supabase, user, context);
  const completion = await completeSignupVerification(supabase, preparedUser);

  return {
    redirectPath: completion.redirectPath,
    error: completion.error,
  };
}
