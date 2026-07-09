import type { SupabaseClient } from "@supabase/supabase-js";
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
    supabase.from("members").select("id"),
    input.authUserId
  ).maybeSingle();

  if (existing) {
    const { error } = await memberUserFilter(
      supabase.from("members"),
      input.authUserId
    ).update(payload);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from("members").insert({
    id: input.authUserId,
    ...payload,
    status: "TRIAL",
    subscription_status: "TRIAL",
    membership_status: "expired",
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
      auth_user_id: input.authUserId,
      ...payload,
      status: "TRIAL",
      subscription_status: "TRIAL",
      membership_status: "expired",
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

  const firstName =
    typeof data.user.user_metadata?.first_name === "string"
      ? data.user.user_metadata.first_name.trim()
      : "";
  const lastName =
    typeof data.user.user_metadata?.last_name === "string"
      ? data.user.user_metadata.last_name.trim()
      : "";

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
