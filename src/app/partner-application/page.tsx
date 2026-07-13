import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PartnerApplicationPage } from "@/components/partner-application/PartnerApplicationPage";
import {
  getAccountTypeFromMetadata,
  isSupabaseConfigured,
  PARTNER_DASHBOARD_PATH,
} from "@/lib/auth";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Business Application",
  description:
    "Complete your FoodVault Partner business application. Connect with New Zealand members, drive direct sales, and grow your independent food brand.",
};

export default async function PartnerApplicationRoute() {
  if (!isSupabaseConfigured()) {
    return <PartnerApplicationPage />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || getAccountTypeFromMetadata(user.user_metadata) !== "partner") {
    redirect(PARTNER_CREATE_ACCOUNT_PATH);
  }

  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (partner) {
    redirect(PARTNER_DASHBOARD_PATH);
  }

  return <PartnerApplicationPage />;
}
