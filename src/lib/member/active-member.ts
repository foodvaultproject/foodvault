import { isSupabaseConfigured } from "@/lib/auth";
import { getAdminUser } from "@/lib/admin/auth";
import { isActiveMemberRow } from "@/lib/member/membership-status";
import { resolveMemberBillingRow } from "@/lib/member/member-record";
import { createClient } from "@/lib/supabase/server";

export type ActiveMemberView = {
  isActiveMember: boolean;
};

/**
 * Server-side check for the Active Member (paid subscriber) experience.
 * Only a logged-in member account with a paid/active membership qualifies —
 * visitors, free trials, free accounts, partners, affiliates and admins do not.
 */
export async function getActiveMemberView(): Promise<ActiveMemberView> {
  if (!isSupabaseConfigured()) {
    return { isActiveMember: false };
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
    return { isActiveMember: false };
  }

  const admin = await getAdminUser();
  if (admin) {
    return { isActiveMember: false };
  }

  const member = await resolveMemberBillingRow(supabase, user.id);
  return { isActiveMember: isActiveMemberRow(member) };
}
