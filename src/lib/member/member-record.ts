import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type MemberRow = {
  id: string;
  auth_user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  country: string | null;
  location: string | null;
  full_name: string | null;
  membership_status: string | null;
  status: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  joined_at: string | null;
  renewal_date: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  deleted_at: string | null;
};

const MEMBER_PROFILE_COLUMNS =
  "id, auth_user_id, first_name, last_name, email, country, location, full_name, membership_status, deleted_at";

const MEMBER_BILLING_COLUMNS =
  "id, auth_user_id, membership_status, status, trial_started_at, trial_ends_at, joined_at, renewal_date, stripe_customer_id, stripe_subscription_id, deleted_at";

function activeMembershipRank(status: string | null | undefined) {
  if (status === "active") return 3;
  if (status === "trialing" || status === "trial") return 2;
  return 1;
}

export function pickCanonicalMemberRow(rows: MemberRow[]): MemberRow | null {
  const visible = rows.filter((row) => !row.deleted_at);
  if (visible.length === 0) {
    return null;
  }

  return [...visible].sort((a, b) => {
    const aPaid = a.stripe_subscription_id ? 1 : 0;
    const bPaid = b.stripe_subscription_id ? 1 : 0;
    if (aPaid !== bPaid) {
      return bPaid - aPaid;
    }

    const aAuthLinked = a.auth_user_id ? 1 : 0;
    const bAuthLinked = b.auth_user_id ? 1 : 0;
    if (aAuthLinked !== bAuthLinked) {
      return bAuthLinked - aAuthLinked;
    }

    const aActive = activeMembershipRank(a.membership_status);
    const bActive = activeMembershipRank(b.membership_status);
    if (aActive !== bActive) {
      return bActive - aActive;
    }

    const aNamed = a.first_name || a.last_name ? 1 : 0;
    const bNamed = b.first_name || b.last_name ? 1 : 0;
    if (aNamed !== bNamed) {
      return bNamed - aNamed;
    }

    return 0;
  })[0];
}

export async function fetchMemberRows(
  supabase: SupabaseClient,
  userId: string
): Promise<MemberRow[]> {
  const { data: byAuth } = await supabase
    .from("members")
    .select(MEMBER_PROFILE_COLUMNS)
    .eq("auth_user_id", userId);

  const { data: byId } = await supabase
    .from("members")
    .select(MEMBER_PROFILE_COLUMNS)
    .eq("id", userId);

  const merged = new Map<string, MemberRow>();
  for (const row of [...(byAuth ?? []), ...(byId ?? [])]) {
    merged.set(row.id, row as MemberRow);
  }

  return [...merged.values()];
}

export async function resolveMemberRow(
  supabase: SupabaseClient,
  userId: string
): Promise<MemberRow | null> {
  const rows = await fetchMemberRows(supabase, userId);
  return pickCanonicalMemberRow(rows);
}

export async function fetchMemberBillingRows(
  supabase: SupabaseClient,
  userId: string
): Promise<MemberRow[]> {
  const { data: byAuth } = await supabase
    .from("members")
    .select(MEMBER_BILLING_COLUMNS)
    .eq("auth_user_id", userId);

  const { data: byId } = await supabase
    .from("members")
    .select(MEMBER_BILLING_COLUMNS)
    .eq("id", userId);

  const merged = new Map<string, MemberRow>();
  for (const row of [...(byAuth ?? []), ...(byId ?? [])]) {
    merged.set(row.id, row as MemberRow);
  }

  return [...merged.values()];
}

export async function resolveMemberBillingRow(
  supabase: SupabaseClient,
  userId: string
): Promise<MemberRow | null> {
  const rows = await fetchMemberBillingRows(supabase, userId);
  return pickCanonicalMemberRow(rows);
}

export function memberRowHasPaidSubscription(row: MemberRow | null | undefined) {
  return Boolean(row?.stripe_subscription_id?.trim());
}

/** True when a cancelled/expired status still has paid time remaining. */
export function memberRowHasPaidPeriodRemaining(
  row: Pick<MemberRow, "renewal_date"> | null | undefined,
  now = Date.now()
) {
  if (!row?.renewal_date) {
    return false;
  }
  const endsAt = new Date(row.renewal_date).getTime();
  return Number.isFinite(endsAt) && endsAt > now;
}

export async function updateMemberRowsForUser(
  userId: string,
  email: string,
  payload: {
    first_name: string;
    last_name: string;
    full_name: string;
    country: string;
    location: string;
  }
) {
  const admin = createAdminClient();
  if (!admin) {
    return { error: "Profile save is unavailable. Please contact support." };
  }

  const { data: rows, error: readError } = await admin
    .from("members")
    .select("id, auth_user_id")
    .or(`auth_user_id.eq.${userId},id.eq.${userId}`);

  if (readError) {
    return { error: readError.message };
  }

  if (!rows || rows.length === 0) {
    const { error: insertError } = await admin.from("members").insert({
      id: userId,
      auth_user_id: userId,
      email,
      ...payload,
      membership_status: "expired",
      status: "TRIAL",
      subscription_status: "TRIAL",
      joined_at: new Date().toISOString(),
    });

    return insertError ? { error: insertError.message } : { error: null };
  }

  const { error: updateError } = await admin
    .from("members")
    .update({
      ...payload,
      auth_user_id: userId,
      email,
      deleted_at: null,
    })
    .or(`auth_user_id.eq.${userId},id.eq.${userId}`);

  if (updateError) {
    return { error: updateError.message };
  }

  return { error: null };
}

function membershipRowGrantsAccess(row: {
  status?: string | null;
  stripe_subscription_id?: string | null;
  renewal_date?: string | null;
  cancellation_date?: string | null;
}) {
  const status = (row.status ?? "").toLowerCase();
  if (status === "active" || status === "trialing" || status === "trial") {
    return true;
  }

  // Paid Stripe subscription still linked → period has not ended yet
  // (includes cancel_at_period_end schedules).
  if (row.stripe_subscription_id?.trim()) {
    return true;
  }

  const periodEnd = row.renewal_date ?? row.cancellation_date;
  if (
    periodEnd &&
    (status === "cancelled" ||
      status === "canceled" ||
      Boolean(row.cancellation_date))
  ) {
    const endsAt = new Date(periodEnd).getTime();
    if (Number.isFinite(endsAt) && endsAt > Date.now()) {
      return true;
    }
  }

  return false;
}

/**
 * Whether a member may use gated benefits (e.g. brand discount codes).
 * Access continues through a scheduled cancellation until period end.
 */
export async function memberHasActiveAccess(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) {
    return false;
  }

  // Prefer the SQL source of truth when the migration is applied.
  const { data: rpcAccess, error: rpcError } = await admin.rpc(
    "member_has_active_access",
    { p_uid: userId }
  );
  if (!rpcError && typeof rpcAccess === "boolean") {
    return rpcAccess;
  }

  const { data: membership } = await admin
    .from("memberships")
    .select("status, stripe_subscription_id, renewal_date, cancellation_date")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (membership && membershipRowGrantsAccess(membership)) {
    return true;
  }

  const { data: members } = await admin
    .from("members")
    .select("membership_status, stripe_subscription_id, renewal_date")
    .or(`auth_user_id.eq.${userId},id.eq.${userId}`);

  return (members ?? []).some((row) =>
    membershipRowGrantsAccess({
      status: row.membership_status,
      stripe_subscription_id: row.stripe_subscription_id,
      renewal_date: row.renewal_date,
    })
  );
}
