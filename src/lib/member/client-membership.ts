import { getAuthSession, isSupabaseConfigured } from "@/lib/auth";
import {
  isActiveMemberRow,
  isFreeTrialMemberRow,
} from "@/lib/member/membership-status";
import {
  fetchMemberBillingRows,
  pickCanonicalMemberRow,
} from "@/lib/member/member-record";
import { createClient } from "@/lib/supabase/client";

export type ClientMembershipView = {
  isFreeTrial: boolean;
  isActiveMember: boolean;
};

export async function resolveClientMembershipView(): Promise<ClientMembershipView> {
  const session = await getAuthSession();

  if (!session || session.accountType !== "member") {
    return { isFreeTrial: false, isActiveMember: false };
  }

  if (!isSupabaseConfigured()) {
    return { isFreeTrial: true, isActiveMember: false };
  }

  const supabase = createClient();
  const rows = await fetchMemberBillingRows(supabase, session.id);
  const member = pickCanonicalMemberRow(rows);

  return {
    isFreeTrial: isFreeTrialMemberRow(member),
    isActiveMember: isActiveMemberRow(member),
  };
}

export async function resolveClientFreeTrialStatus(): Promise<boolean> {
  return (await resolveClientMembershipView()).isFreeTrial;
}
