import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type StartMemberTrialParams = {
  authUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  marketingOptIn: boolean;
};

const MISSING_FUNCTION_PATTERN =
  /could not find the function|schema cache|function public\.start_member_trial/i;

const RETRYABLE_TRIAL_ERROR_PATTERN =
  /members_id_fkey|foreign key constraint|violates foreign key/i;

async function syncTrialMembershipRecord(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  authUserId: string,
  trialEndsAt: Date
) {
  await admin.rpc("sync_membership_record", {
    p_auth_user_id: authUserId,
    p_status: "trialing",
    p_stripe_customer_id: null,
    p_stripe_subscription_id: null,
    p_renewal_date: trialEndsAt.toISOString(),
    p_cancellation_date: null,
  });
}

async function startMemberTrialViaAdmin(params: StartMemberTrialParams) {
  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Trial signup is not configured yet. Apply the Supabase migration supabase/migrations/20250627400000_fix_start_member_trial.sql in your project SQL editor.",
    };
  }

  const { data: settings, error: settingsError } = await admin
    .from("system_settings")
    .select("trial_length_days")
    .limit(1)
    .maybeSingle();

  if (settingsError) {
    return { error: settingsError.message };
  }

  const trialDays = settings?.trial_length_days ?? 7;
  const trialStartedAt = new Date();
  const trialEndsAt = new Date(trialStartedAt);
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  const memberPayload = {
    auth_user_id: params.authUserId,
    email: params.email,
    full_name: `${params.firstName} ${params.lastName}`.trim(),
    first_name: params.firstName,
    last_name: params.lastName,
    country: params.country,
    location: params.country,
    marketing_opt_in: params.marketingOptIn,
    status: "TRIAL",
    subscription_status: "TRIAL",
    membership_status: "trialing",
    trial_started_at: trialStartedAt.toISOString(),
    trial_ends_at: trialEndsAt.toISOString(),
    joined_at: trialStartedAt.toISOString(),
    deleted_at: null,
  };

  const { data: existingMember } = await admin
    .from("members")
    .select("id")
    .eq("auth_user_id", params.authUserId)
    .maybeSingle();

  const memberError = existingMember
    ? (
        await admin
          .from("members")
          .update(memberPayload)
          .eq("auth_user_id", params.authUserId)
      ).error
    : (
        await admin.from("members").insert({
          id: params.authUserId,
          ...memberPayload,
        })
      ).error;

  if (memberError) {
    return { error: memberError.message };
  }

  await syncTrialMembershipRecord(admin, params.authUserId, trialEndsAt);

  return { error: null };
}

export async function startMemberTrial(
  supabase: SupabaseClient,
  params: StartMemberTrialParams
) {
  const adminResult = await startMemberTrialViaAdmin(params);
  if (!adminResult.error) {
    return adminResult;
  }

  const { error: rpcError } = await supabase.rpc("start_member_trial", {
    p_first_name: params.firstName,
    p_last_name: params.lastName,
    p_country: params.country,
    p_marketing_opt_in: params.marketingOptIn,
  });

  if (!rpcError) {
    return { error: null };
  }

  if (
    MISSING_FUNCTION_PATTERN.test(rpcError.message) ||
    RETRYABLE_TRIAL_ERROR_PATTERN.test(rpcError.message)
  ) {
    return startMemberTrialViaAdmin(params);
  }

  return { error: rpcError.message };
}
