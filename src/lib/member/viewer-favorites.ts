import { isSupabaseConfigured } from "@/lib/auth";
import { getRequestSupabaseSession } from "@/lib/auth/request-session";
import { getAdminUser } from "@/lib/admin/auth";

export type ViewerFavoriteContext = {
  canFavorite: boolean;
  favoritedPartnerIds: string[];
};

export async function getViewerFavoriteContext(): Promise<ViewerFavoriteContext> {
  if (!isSupabaseConfigured()) {
    return { canFavorite: false, favoritedPartnerIds: [] };
  }

  const { supabase, user } = await getRequestSupabaseSession();

  if (!user || user.user_metadata?.account_type === "partner") {
    return { canFavorite: false, favoritedPartnerIds: [] };
  }

  const admin = await getAdminUser();
  if (admin) {
    return { canFavorite: false, favoritedPartnerIds: [] };
  }

  const { data } = await supabase
    .from("member_favorites")
    .select("partner_id")
    .eq("member_auth_user_id", user.id);

  return {
    canFavorite: true,
    favoritedPartnerIds: (data ?? []).map((row) => row.partner_id as string),
  };
}
