import { isSupabaseConfigured } from "@/lib/auth";
import {
  memberRowHasPaidSubscription,
  resolveMemberBillingRow,
  resolveMemberRow,
} from "@/lib/member/member-record";
import { isTrialingStatus } from "@/lib/member/membership-status";
import { getMembershipSettings } from "@/lib/member/settings";
import { resolveEffectiveTrialEndsAt } from "@/lib/member/trial-ends-at";
import { createClient } from "@/lib/supabase/server";

export type MemberProfile = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
};

export type MemberTrialBanner = {
  daysRemaining: number;
  trialLengthDays: number;
  trialEndsAt: string | null;
  membershipPriceMonthly: number;
  showTrialBanner: boolean;
};

export type MembershipRecord = {
  status: "trialing" | "active" | "cancelled" | "expired";
  renewalDate: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

const DEV_PROFILE: MemberProfile = {
  firstName: "Julian",
  lastName: "Vanderbilt",
  email: "member@example.com",
  country: "New Zealand",
};

const DEV_TRIAL: MemberTrialBanner = {
  daysRemaining: 9,
  trialLengthDays: 7,
  trialEndsAt: new Date(Date.now() + 9 * 86400000).toISOString(),
  membershipPriceMonthly: 20,
  showTrialBanner: true,
};

const DEV_MEMBERSHIP: MembershipRecord = {
  status: "trialing",
  renewalDate: new Date(Date.now() + 10 * 86400000).toISOString(),
  stripeCustomerId: null,
  stripeSubscriptionId: null,
};

function daysUntil(dateValue: string | null | undefined) {
  if (!dateValue) return 0;
  const end = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((end.getTime() - today.getTime()) / 86400000));
}

function normalizeMembershipStatus(
  rawStatus: string | null | undefined,
  stripeSubscriptionId: string | null | undefined
): MembershipRecord["status"] {
  if (stripeSubscriptionId?.trim()) {
    return "active";
  }

  const normalized = (rawStatus ?? "trialing").toLowerCase();
  if (normalized === "trial") {
    return "trialing";
  }

  if (
    normalized === "active" ||
    normalized === "trialing" ||
    normalized === "cancelled" ||
    normalized === "expired"
  ) {
    return normalized;
  }

  return "trialing";
}

function isPaidMembership(membership: MembershipRecord | null | undefined) {
  return (
    membership?.status === "active" ||
    Boolean(membership?.stripeSubscriptionId?.trim())
  );
}

export async function getMemberProfile(userId: string): Promise<MemberProfile | null> {
  if (!isSupabaseConfigured()) {
    return DEV_PROFILE;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const data = await resolveMemberRow(supabase, userId);

  if (!data) {
    const metadataFirstName =
      typeof user?.user_metadata?.first_name === "string"
        ? user.user_metadata.first_name.trim()
        : "";
    const metadataLastName =
      typeof user?.user_metadata?.last_name === "string"
        ? user.user_metadata.last_name.trim()
        : "";

    if (metadataFirstName || metadataLastName) {
      return {
        firstName: metadataFirstName || "Member",
        lastName: metadataLastName,
        email: user?.email ?? "",
        country: "New Zealand",
      };
    }

    return null;
  }

  const metadataFirstName =
    typeof user?.user_metadata?.first_name === "string"
      ? user.user_metadata.first_name.trim()
      : "";
  const metadataLastName =
    typeof user?.user_metadata?.last_name === "string"
      ? user.user_metadata.last_name.trim()
      : "";

  const fullName = data.full_name?.trim() ?? "";
  const nameParts = fullName.split(/\s+/).filter(Boolean);

  return {
    firstName:
      data.first_name?.trim() ||
      metadataFirstName ||
      nameParts[0] ||
      "Member",
    lastName:
      data.last_name?.trim() ||
      metadataLastName ||
      nameParts.slice(1).join(" ") ||
      "",
    email: data.email ?? user?.email ?? "",
    country: data.country ?? data.location ?? "New Zealand",
  };
}

export async function getMemberTrialBanner(
  userId: string
): Promise<MemberTrialBanner | null> {
  const settings = await getMembershipSettings();

  if (!isSupabaseConfigured()) {
    return { ...DEV_TRIAL, ...settings, showTrialBanner: true };
  }

  const membership = await getMembershipRecord(userId);
  if (isPaidMembership(membership)) {
    return null;
  }

  const supabase = await createClient();
  const data = await resolveMemberBillingRow(supabase, userId);

  if (
    !data ||
    memberRowHasPaidSubscription(data) ||
    !isTrialingStatus(data.membership_status ?? data.status)
  ) {
    return null;
  }

  const effectiveTrialEndsAt = resolveEffectiveTrialEndsAt(
    data.trial_started_at,
    data.trial_ends_at,
    settings.trialLengthDays,
    data.joined_at
  );

  const daysRemaining = daysUntil(effectiveTrialEndsAt);

  return {
    daysRemaining,
    trialLengthDays: settings.trialLengthDays,
    trialEndsAt: effectiveTrialEndsAt,
    membershipPriceMonthly: settings.membershipPriceMonthly,
    showTrialBanner: true,
  };
}

export async function getMembershipRecord(
  userId: string
): Promise<MembershipRecord | null> {
  if (!isSupabaseConfigured()) {
    return DEV_MEMBERSHIP;
  }

  const supabase = await createClient();
  const [{ data: membershipRow }, member] = await Promise.all([
    supabase
      .from("memberships")
      .select(
        "status, renewal_date, stripe_customer_id, stripe_subscription_id"
      )
      .eq("auth_user_id", userId)
      .maybeSingle(),
    resolveMemberBillingRow(supabase, userId),
  ]);

  const stripeSubscriptionId =
    membershipRow?.stripe_subscription_id?.trim() ||
    member?.stripe_subscription_id?.trim() ||
    null;
  const stripeCustomerId =
    membershipRow?.stripe_customer_id?.trim() ||
    member?.stripe_customer_id?.trim() ||
    null;
  const renewalDate =
    membershipRow?.renewal_date ??
    member?.renewal_date ??
    member?.trial_ends_at ??
    null;

  if (stripeSubscriptionId) {
    return {
      status: "active",
      renewalDate,
      stripeCustomerId,
      stripeSubscriptionId,
    };
  }

  if (membershipRow) {
    return {
      status: normalizeMembershipStatus(
        membershipRow.status,
        membershipRow.stripe_subscription_id
      ),
      renewalDate: membershipRow.renewal_date,
      stripeCustomerId: membershipRow.stripe_customer_id,
      stripeSubscriptionId: membershipRow.stripe_subscription_id,
    };
  }

  if (!member) {
    return null;
  }

  return {
    status: normalizeMembershipStatus(
      member.membership_status ?? member.status,
      member.stripe_subscription_id
    ),
    renewalDate: member.renewal_date ?? member.trial_ends_at,
    stripeCustomerId: member.stripe_customer_id,
    stripeSubscriptionId: member.stripe_subscription_id,
  };
}

