import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveMemberNameFromMetadata } from "@/lib/auth/oauth-display-name";
import { createAdminClient } from "@/lib/supabase/admin";
import { memberUserFilter } from "@/lib/member/auth";

export type MemberSignupProfileInput = {
  authUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  marketingOptIn?: boolean;
};

const UNPAID_MEMBER_STATUS = {
  status: "EXPIRED",
  subscription_status: "EXPIRED",
  membership_status: "expired",
} as const;

function isTrialStatus(status: string | null | undefined) {
  const normalized = (status ?? "").toLowerCase();
  return normalized === "trial" || normalized === "trialing";
}

export async function upsertMemberSignupProfile(
  supabase: SupabaseClient,
  input: MemberSignupProfileInput
) {
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const payload = {
    auth_user_id: input.authUserId,
    email: input.email,
    first_name: input.firstName,
    last_name: input.lastName,
    full_name: fullName,
    country: input.country,
    location: input.country,
    marketing_opt_in: input.marketingOptIn ?? false,
    deleted_at: null,
  };

  const { data: existing } = await memberUserFilter(
    supabase.from("members").select("id, membership_status, status"),
    input.authUserId
  ).maybeSingle();

  if (existing) {
    const shouldClearTrial =
      isTrialStatus(existing.membership_status) || isTrialStatus(existing.status);
    const { error } = await memberUserFilter(
      supabase.from("members").update({
        ...payload,
        ...(shouldClearTrial ? UNPAID_MEMBER_STATUS : {}),
      }),
      input.authUserId
    );
    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from("members").insert({
    id: input.authUserId,
    ...payload,
    ...UNPAID_MEMBER_STATUS,
    joined_at: new Date().toISOString(),
  });

  if (!error) {
    return { error: null };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { error: error.message };
  }

  const { error: adminError } = await admin.from("members").upsert(
    {
      id: input.authUserId,
      ...payload,
      ...UNPAID_MEMBER_STATUS,
      joined_at: new Date().toISOString(),
    },
    { onConflict: "auth_user_id" }
  );

  return { error: adminError?.message ?? null };
}

export async function syncMemberProfileFromAuth(authUserId: string) {
  const admin = createAdminClient();
  if (!admin) {
    return;
  }

  const { data, error } = await admin.auth.admin.getUserById(authUserId);
  if (error || !data.user) {
    return;
  }

  const metadata = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  const { firstName, lastName } = resolveMemberNameFromMetadata(metadata);

  if (!firstName && !lastName) {
    return;
  }

  await admin
    .from("members")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      full_name: `${firstName} ${lastName}`.trim() || null,
    })
    .or(`auth_user_id.eq.${authUserId},id.eq.${authUserId}`);
}
