import { isCurrentUserAdminAction } from "@/lib/admin/auth";
import { getAuthSession, isSupabaseConfigured } from "@/lib/auth";
import {
  isActiveMemberRow,
  isFreeTrialMemberRow,
} from "@/lib/member/membership-status";
import {
  fetchMemberBillingRows,
  pickCanonicalMemberRow,
} from "@/lib/member/member-record";
import { resolveEffectiveTrialEndsAt } from "@/lib/member/trial-ends-at";
import { createClient } from "@/lib/supabase/client";
import { fetchSystemSettingsRow } from "@/lib/system-settings-db";
import {
  DEFAULT_TRIAL_LENGTH_DAYS,
  parseSystemSettingsRow,
} from "@/lib/system-settings";

export type ClientMembershipView = {
  isFreeTrial: boolean;
  isActiveMember: boolean;
  trialEndsAt: string | null;
};

const VISITOR_MEMBERSHIP_VIEW: ClientMembershipView = {
  isFreeTrial: false,
  isActiveMember: false,
  trialEndsAt: null,
};

export async function resolveClientMembershipView(): Promise<ClientMembershipView> {
  const session = await getAuthSession();

  if (!session || session.accountType !== "member") {
    return VISITOR_MEMBERSHIP_VIEW;
  }

  // Admins browsing the public site should match the visitor experience —
  // no free-trial countdown, no paid-member chrome.
  if (await isCurrentUserAdminAction()) {
    return VISITOR_MEMBERSHIP_VIEW;
  }

  if (!isSupabaseConfigured()) {
    const trialEndsAt = new Date(
      Date.now() + DEFAULT_TRIAL_LENGTH_DAYS * 86_400_000
    ).toISOString();
    return { isFreeTrial: true, isActiveMember: false, trialEndsAt };
  }

  const supabase = createClient();
  const [rows, settingsRow] = await Promise.all([
    fetchMemberBillingRows(supabase, session.id),
    fetchSystemSettingsRow(supabase),
  ]);
  const member = pickCanonicalMemberRow(rows);
  const trialLengthDays = parseSystemSettingsRow(settingsRow).trial_length_days;

  return {
    isFreeTrial: isFreeTrialMemberRow(member),
    isActiveMember: isActiveMemberRow(member),
    trialEndsAt: resolveEffectiveTrialEndsAt(
      member?.trial_started_at,
      member?.trial_ends_at,
      trialLengthDays,
      member?.joined_at
    ),
  };
}
