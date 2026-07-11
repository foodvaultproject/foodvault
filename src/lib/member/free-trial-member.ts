import { isSupabaseConfigured } from "@/lib/auth";
import { getAdminUser } from "@/lib/admin/auth";
import {
  isActiveMemberRow,
  isFreeTrialMemberRow,
} from "@/lib/member/membership-status";
import { resolveMemberBillingRow } from "@/lib/member/member-record";
import { createClient } from "@/lib/supabase/server";

export type FreeTrialMemberView = {
  isFreeTrialMember: boolean;
};

/**
 * Server-side check for the Free Trial member homepage experience.
 * Only a logged-in member account with an active trial qualifies —
 * visitors, paid members, partners, affiliates and admins do not.
 */
export async function getFreeTrialMemberView(): Promise<FreeTrialMemberView> {
  if (!isSupabaseConfigured()) {
    return { isFreeTrialMember: false };
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
    return { isFreeTrialMember: false };
  }

  const admin = await getAdminUser();
  if (admin) {
    return { isFreeTrialMember: false };
  }

  const member = await resolveMemberBillingRow(supabase, user.id);
  if (isActiveMemberRow(member)) {
    return { isFreeTrialMember: false };
  }

  return { isFreeTrialMember: isFreeTrialMemberRow(member) };
}
