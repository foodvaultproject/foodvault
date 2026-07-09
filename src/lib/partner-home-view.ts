import { isSupabaseConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type PartnerHomeView = {
  isPartner: boolean;
};

/**
 * Server-side check for the Partner (brand advertiser) experience.
 * A partner is identified by their auth metadata account_type, with a
 * best-effort fallback to an owned `partners` row. Members, affiliates,
 * admins and visitors do not qualify.
 */
export async function getPartnerHomeView(): Promise<PartnerHomeView> {
  if (!isSupabaseConfigured()) {
    return { isPartner: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isPartner: false };
  }

  if (user.user_metadata?.account_type === "partner") {
    return { isPartner: true };
  }

  const { data } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { isPartner: Boolean(data) };
}
