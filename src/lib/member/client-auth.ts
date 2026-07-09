import { isSupabaseConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export async function isAdminAccount(userId: string) {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", userId)
    .maybeSingle();

  return Boolean(data);
}
