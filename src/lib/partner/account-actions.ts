"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured, PARTNER_LOGIN_PATH } from "@/lib/auth";
import { revalidatePublicBrandDirectory } from "@/lib/cache/revalidate";
import { createClient } from "@/lib/supabase/server";

type SoftDeleteResult = {
  id?: string;
  slug?: string | null;
  deleted_at?: string | null;
};

export async function deletePartnerProfileAction() {
  if (!isSupabaseConfigured()) {
    redirect(`${PARTNER_LOGIN_PATH}?deleted=1`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PARTNER_LOGIN_PATH);
  }

  const { data: existing } = await supabase
    .from("partners")
    .select("id, slug, deleted_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    return { error: "We couldn't find a partner profile for this account." };
  }

  let slug = typeof existing.slug === "string" ? existing.slug : null;

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "soft_delete_partner_account"
  );

  if (rpcError) {
    const deletedAt = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from("partners")
      .update({
        deleted_at: deletedAt,
        listing_status_v2: "PENDING",
        updated_at: deletedAt,
      })
      .eq("user_id", user.id)
      .select("id, slug")
      .maybeSingle();

    if (error) {
      return {
        error:
          error.message ||
          "We couldn't delete your partner profile. Please try again or contact support.",
      };
    }

    await supabase
      .from("partners")
      .update({
        member_offer_confirmed: false,
        affiliate_enabled: false,
        business_status: "deleted",
      })
      .eq("user_id", user.id);

    slug = typeof updated?.slug === "string" ? updated.slug : slug;
  } else if (rpcData && typeof rpcData === "object") {
    const result = rpcData as SoftDeleteResult;
    if (typeof result.slug === "string") slug = result.slug;
  }

  revalidatePublicBrandDirectory({ slug });
  await supabase.auth.signOut();
  redirect(`${PARTNER_LOGIN_PATH}?deleted=1`);
}
