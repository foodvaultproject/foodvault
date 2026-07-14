"use server";

import { sendPartnerListingLiveEmailForPartner } from "@/lib/email-templates/dispatch";
import { createClient } from "@/lib/supabase/server";

export async function confirmMemberOfferLiveAction(partnerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: before, error: fetchError } = await supabase
    .from("partners")
    .select("listing_status_v2")
    .eq("id", partnerId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !before) {
    return { error: fetchError?.message ?? "Partner record not found." };
  }

  const wasNotLive = String(before.listing_status_v2).toUpperCase() !== "LIVE";

  const { error } = await supabase.rpc("confirm_partner_offer_live", {
    p_partner_id: partnerId,
  });

  if (error) {
    return { error: error.message };
  }

  if (wasNotLive) {
    void sendPartnerListingLiveEmailForPartner(partnerId).catch((emailError) => {
      console.error("[partner] Failed to send listing live email", {
        partnerId,
        error: emailError instanceof Error ? emailError.message : emailError,
      });
    });
  }

  return { success: true as const };
}
