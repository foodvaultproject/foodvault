import { redirect } from "next/navigation";
import { isSupabaseConfigured, LOGIN_PATH } from "@/lib/auth";
import { repairMemberSessionIfNeeded } from "@/lib/auth/session-completion";
import { getAdminUser } from "@/lib/admin/auth";
import { ADMIN_DASHBOARD_PATH } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/server";

export type AuthenticatedMember = {
  id: string;
  email: string;
};

export function memberUserFilter<T extends { or: (filters: string) => T }>(
  query: T,
  userId: string
) {
  return query.or(`auth_user_id.eq.${userId},id.eq.${userId}`);
}

export async function requireAuthenticatedMember(): Promise<AuthenticatedMember> {
  if (!isSupabaseConfigured()) {
    return {
      id: "dev-member",
      email: "member@example.com",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(LOGIN_PATH);
  }

  if (user.user_metadata?.account_type === "partner") {
    redirect("/partner/listing");
  }

  await repairMemberSessionIfNeeded(supabase, user);

  const { data: member } = await memberUserFilter(
    supabase.from("members").select("deleted_at"),
    user.id
  ).maybeSingle();

  if (member?.deleted_at) {
    redirect(LOGIN_PATH);
  }

  return { id: user.id, email: user.email };
}

export async function requireMemberFavoritesAccess(): Promise<AuthenticatedMember> {
  const member = await requireAuthenticatedMember();

  if (isSupabaseConfigured()) {
    const admin = await getAdminUser();
    if (admin) {
      redirect(ADMIN_DASHBOARD_PATH);
    }
  }

  return member;
}
