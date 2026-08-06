import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  buildEnablePartnerMetadata,
  hasPartnerAccess,
} from "@/lib/auth/account-roles";

export async function enablePartnerProfileOnUser(
  supabase: SupabaseClient,
  user: User
): Promise<{ user: User; error?: string }> {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  if (hasPartnerAccess(metadata)) {
    return { user };
  }

  const { error } = await supabase.auth.updateUser({
    data: buildEnablePartnerMetadata(metadata),
  });

  if (error) {
    return { user, error: error.message };
  }

  const {
    data: { user: refreshed },
  } = await supabase.auth.getUser();

  return { user: refreshed ?? user };
}
