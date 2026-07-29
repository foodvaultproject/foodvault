import { isSupabaseConfigured } from "@/lib/auth";
import { resolveMemberFirstName } from "@/lib/member/active-member";
import { createClient } from "@/lib/supabase/server";

function firstWord(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0] ?? null;
}

export type PartnerHomeView = {
  isPartner: boolean;
  partnerName: string | null;
};

/**
 * Server-side check for the Partner (brand advertiser) experience.
 * A partner is identified by their auth metadata account_type, with a
 * best-effort fallback to an owned `partners` row. Members, affiliates,
 * admins and visitors do not qualify.
 */
export async function getPartnerHomeView(): Promise<PartnerHomeView> {
  if (!isSupabaseConfigured()) {
    return { isPartner: false, partnerName: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isPartner: false, partnerName: null };
  }

  if (user.user_metadata?.account_type === "partner") {
    const { data: partner } = await supabase
      .from("partners")
      .select("contact_name")
      .eq("user_id", user.id)
      .maybeSingle();

    return {
      isPartner: true,
      partnerName:
        firstWord(partner?.contact_name) ?? resolveMemberFirstName(null, user),
    };
  }

  const { data } = await supabase
    .from("partners")
    .select("id, contact_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    isPartner: Boolean(data),
    partnerName: data
      ? firstWord(data.contact_name) ?? resolveMemberFirstName(null, user)
      : null,
  };
}
