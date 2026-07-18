import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  type AccountType,
  getAccountTypeFromMetadata,
  PARTNER_DASHBOARD_PATH,
  resolvePostLoginRedirect,
} from "@/lib/auth";
import { completeSignupVerification } from "@/lib/auth/complete-verification";
import { resolveVerifiedRedirectPath } from "@/lib/auth/resolve-verified-redirect";
import {
  fetchMemberBillingRows,
  pickCanonicalMemberRow,
} from "@/lib/member/member-record";
import {
  isActiveMemberRow,
  isFreeTrialMemberRow,
} from "@/lib/member/membership-status";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

export function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback = ""
) {
  const value = metadata[key];
  return typeof value === "string" ? value.trim() : fallback;
}

export async function memberProfileExists(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const rows = await fetchMemberBillingRows(supabase, userId);
  return pickCanonicalMemberRow(rows) !== null;
}

/** Member row exists with trial or paid access — matches UI state checks. */
export async function hasMemberAccessProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const row = pickCanonicalMemberRow(await fetchMemberBillingRows(supabase, userId));
  if (!row) {
    return false;
  }

  return isFreeTrialMemberRow(row) || isActiveMemberRow(row);
}

/** True when onboarding metadata and required profile rows exist. */
export async function isSignupSetupComplete(
  supabase: SupabaseClient,
  user: User,
  expectedAccountType?: AccountType
): Promise<boolean> {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const signupCompletedAt = readMetadataString(metadata, "signup_completed_at");
  const accountType = expectedAccountType ?? getAccountTypeFromMetadata(metadata);

  if (accountType === "member") {
    return (
      Boolean(signupCompletedAt) &&
      (await hasMemberAccessProfile(supabase, user.id))
    );
  }

  if (!signupCompletedAt) {
    return false;
  }

  return true;
}

export type SessionCompletionContext = {
  expectedAccountType: AccountType;
  nextPath?: string | null;
  signupMode?: "trial" | "membership";
  marketingOptIn?: boolean;
};

export function resolvePostSignupRedirect(
  accountType: AccountType,
  metadata: Record<string, unknown> | undefined,
  nextPath?: string | null,
  completionRedirect?: string
) {
  if (nextPath && nextPath.startsWith("/")) {
    return nextPath;
  }

  if (completionRedirect) {
    return completionRedirect;
  }

  return resolveVerifiedRedirectPath(accountType, metadata);
}

export async function resolvePartnerLoginRedirect(
  supabase: SupabaseClient,
  userId: string,
  nextPath?: string | null
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

export async function resolveAuthenticatedRedirect(
  supabase: SupabaseClient,
  user: User,
  context: SessionCompletionContext
): Promise<string> {
  if (context.expectedAccountType === "partner" && user.id) {
    return resolvePartnerLoginRedirect(supabase, user.id, context.nextPath);
  }

  return resolvePostLoginRedirect(
    context.expectedAccountType,
    context.nextPath
  );
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

export async function prepareAuthUserMetadata(
  supabase: SupabaseClient,
  user: User,
  context: SessionCompletionContext
): Promise<{ user: User; error?: string }> {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  if (readMetadataString(metadata, "signup_completed_at")) {
    const accountType = getAccountTypeFromMetadata(metadata);
    if (accountType !== "member") {
      return { user };
    }

    if (await hasMemberAccessProfile(supabase, user.id)) {
      return { user };
    }
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
    return { user, error: error.message };
  }

  const {
    data: { user: refreshed },
  } = await supabase.auth.getUser();

  return { user: refreshed ?? user };
}

/** Match email confirm + check-email: finish onboarding, then redirect. */
export async function ensureAuthenticatedSession(
  supabase: SupabaseClient,
  user: User,
  context: SessionCompletionContext
): Promise<{ redirectPath: string; error?: string }> {
  const setupComplete = await isSignupSetupComplete(
    supabase,
    user,
    context.expectedAccountType
  );

  if (setupComplete) {
    return {
      redirectPath: await resolveAuthenticatedRedirect(supabase, user, context),
    };
  }

  const prepared = await prepareAuthUserMetadata(supabase, user, context);
  if (prepared.error) {
    return {
      redirectPath: await resolveAuthenticatedRedirect(supabase, user, context),
      error: prepared.error,
    };
  }

  const completion = await completeSignupVerification(supabase, prepared.user);
  const metadata = (prepared.user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    redirectPath: resolvePostSignupRedirect(
      context.expectedAccountType,
      metadata,
      context.nextPath,
      completion.redirectPath
    ),
    error: completion.error,
  };
}

function resolveMemberSignupMode(
  metadata: Record<string, unknown> | undefined
): "trial" | "membership" {
  const signupMode = readMetadataString(metadata ?? {}, "signup_mode", "trial");
  return signupMode === "membership" ? "membership" : "trial";
}

/** Self-heal authenticated members missing trial/profile rows (common after OAuth). */
export async function repairMemberSessionIfNeeded(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  if (!user.email_confirmed_at) {
    return;
  }

  const accountType = getAccountTypeFromMetadata(user.user_metadata);
  if (accountType === "partner" || accountType === "affiliate") {
    return;
  }

  if (await isSignupSetupComplete(supabase, user, "member")) {
    return;
  }

  await ensureAuthenticatedSession(supabase, user, {
    expectedAccountType: "member",
    signupMode: resolveMemberSignupMode(
      (user.user_metadata ?? {}) as Record<string, unknown>
    ),
  });
}
