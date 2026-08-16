"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/auth";
import { MEMBER_DASHBOARD_PATH, MEMBER_FAVORITES_PATH } from "@/lib/member/paths";
import { createClient } from "@/lib/supabase/server";
import { requireAuthenticatedMember } from "@/lib/member/auth";
import { getViewerFavoriteContext } from "@/lib/member/viewer-favorites";

export async function getViewerFavoriteContextAction() {
  return getViewerFavoriteContext();
}

export async function addFavoritePartnerAction(partnerId: string) {
  const member = await requireAuthenticatedMember();

  if (!partnerId) {
    return { error: "Partner not found." };
  }

  if (!isSupabaseConfigured()) {
    return { success: true as const };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("member_favorites").upsert(
    {
      member_auth_user_id: member.id,
      partner_id: partnerId,
    },
    { onConflict: "member_auth_user_id,partner_id", ignoreDuplicates: true }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(MEMBER_FAVORITES_PATH);
  revalidatePath(MEMBER_DASHBOARD_PATH);
  return { success: true as const };
}

export async function removeFavoritePartnerAction(partnerId: string) {
  const member = await requireAuthenticatedMember();

  if (!partnerId) {
    return { error: "Partner not found." };
  }

  if (!isSupabaseConfigured()) {
    return { success: true as const };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("member_favorites")
    .delete()
    .eq("member_auth_user_id", member.id)
    .eq("partner_id", partnerId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(MEMBER_FAVORITES_PATH);
  revalidatePath(MEMBER_DASHBOARD_PATH);
  return { success: true as const };
}

export async function toggleFavoritePartnerAction(
  partnerId: string,
  currentlyFavorited: boolean
) {
  if (currentlyFavorited) {
    return removeFavoritePartnerAction(partnerId);
  }
  return addFavoritePartnerAction(partnerId);
}
