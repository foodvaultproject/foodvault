import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/auth";
import { getAdminUser } from "@/lib/admin/auth";
import { isActiveMemberRow } from "@/lib/member/membership-status";
import {
  resolveMemberBillingRow,
  resolveMemberRow,
  type MemberRow,
} from "@/lib/member/member-record";
import { createClient } from "@/lib/supabase/server";

export type ActiveMemberView = {
  isActiveMember: boolean;
  memberName: string | null;
};

function firstWord(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0] ?? null;
}

function resolveMemberFirstName(
  profile: MemberRow | null,
  user: User
): string | null {
  const metadata = user.user_metadata ?? {};
  return (
    firstWord(profile?.first_name) ??
    firstWord(profile?.full_name) ??
    firstWord(metadata.first_name as string | undefined) ??
    firstWord(
      (metadata.full_name as string | undefined) ??
        (metadata.name as string | undefined)
    )
  );
}

/**
 * Server-side check for the Active Member (paid subscriber) experience.
 * Only a logged-in member account with a paid/active membership qualifies —
 * visitors, free trials, free accounts, partners, affiliates and admins do not.
 */
export async function getActiveMemberView(): Promise<ActiveMemberView> {
  if (!isSupabaseConfigured()) {
    return { isActiveMember: false, memberName: null };
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
    return { isActiveMember: false, memberName: null };
  }

  const admin = await getAdminUser();
  if (admin) {
    return { isActiveMember: false, memberName: null };
  }

  const member = await resolveMemberBillingRow(supabase, user.id);
  if (!isActiveMemberRow(member)) {
    return { isActiveMember: false, memberName: null };
  }

  const profile = await resolveMemberRow(supabase, user.id);
  return {
    isActiveMember: true,
    memberName: resolveMemberFirstName(profile, user),
  };
}
