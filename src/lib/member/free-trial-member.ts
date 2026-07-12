import { isSupabaseConfigured } from "@/lib/auth";
import { getAdminUser } from "@/lib/admin/auth";
import { resolveMemberFirstName } from "@/lib/member/active-member";
import {
  isActiveMemberRow,
  isFreeTrialMemberRow,
} from "@/lib/member/membership-status";
import {
  resolveMemberBillingRow,
  resolveMemberRow,
} from "@/lib/member/member-record";
import { createClient } from "@/lib/supabase/server";

export type FreeTrialMemberView = {
  isFreeTrialMember: boolean;
  memberName: string | null;
};

/**
 * Server-side check for the Free Trial member homepage experience.
 * Only a logged-in member account with an active trial qualifies —
 * visitors, paid members, partners, affiliates and admins do not.
 */
export async function getFreeTrialMemberView(): Promise<FreeTrialMemberView> {
  if (!isSupabaseConfigured()) {
    return { isFreeTrialMember: false, memberName: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user ||
    user.user_metadata?.account_type === "partner" ||
    user.user_metadata?.account_type === "affiliate"
  ) {
    return { isFreeTrialMember: false, memberName: null };
  }

  const admin = await getAdminUser();
  if (admin) {
    return { isFreeTrialMember: false, memberName: null };
  }

  const member = await resolveMemberBillingRow(supabase, user.id);
  if (isActiveMemberRow(member) || !isFreeTrialMemberRow(member)) {
    return { isFreeTrialMember: false, memberName: null };
  }

  const profile = await resolveMemberRow(supabase, user.id);
  return {
    isFreeTrialMember: true,
    memberName: resolveMemberFirstName(profile, user),
  };
}
