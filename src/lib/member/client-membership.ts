import { isCurrentUserAdminAction } from "@/lib/admin/auth";
import { getAuthSession, isSupabaseConfigured } from "@/lib/auth";
import { isActiveMemberRow } from "@/lib/member/membership-status";
import {
  fetchMemberBillingRows,
  pickCanonicalMemberRow,
} from "@/lib/member/member-record";
import { createClient } from "@/lib/supabase/client";

export type ClientMembershipView = {
  isActiveMember: boolean;
};

const VISITOR_MEMBERSHIP_VIEW: ClientMembershipView = {
  isActiveMember: false,
};

export async function resolveClientMembershipView(): Promise<ClientMembershipView> {
  const session = await getAuthSession();

  if (!session || session.accountType !== "member") {
    return VISITOR_MEMBERSHIP_VIEW;
  }

  // Admins browsing the public site should match the visitor experience.
  if (await isCurrentUserAdminAction()) {
    return VISITOR_MEMBERSHIP_VIEW;
  }

  if (!isSupabaseConfigured()) {
    return VISITOR_MEMBERSHIP_VIEW;
  }

  const supabase = createClient();
  const rows = await fetchMemberBillingRows(supabase, session.id);
  const member = pickCanonicalMemberRow(rows);

  return {
    isActiveMember: isActiveMemberRow(member),
  };
}
