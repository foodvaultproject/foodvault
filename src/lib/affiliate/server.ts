import { createClient } from "@/lib/supabase/server";
import { buildReferralUrl } from "@/lib/affiliate/links";

export type BrandAffiliateViewerContext = {
  isAffiliate: boolean;
  referralUrl: string | null;
};

export async function getBrandAffiliateViewerContext(
  partnerId: string
): Promise<BrandAffiliateViewerContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAffiliate: false, referralUrl: null };
  }

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!affiliate) {
    return { isAffiliate: false, referralUrl: null };
  }

  const { data: link } = await supabase
    .from("affiliate_referral_links")
    .select("link_path")
    .eq("affiliate_id", affiliate.id)
    .eq("partner_id", partnerId)
    .maybeSingle();

  return {
    isAffiliate: true,
    referralUrl: link?.link_path ? buildReferralUrl(String(link.link_path)) : null,
  };
}
