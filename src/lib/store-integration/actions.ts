"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { disconnectStoreIntegration } from "@/lib/store-integration/engine";
import { revalidatePath } from "next/cache";
import { PARTNER_AFFILIATE_PROGRAM_PATH } from "@/lib/partner-affiliate/paths";

export async function disconnectPartnerStoreAction(platform: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/partner/login");
  }

  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!partner) {
    throw new Error("Partner not found");
  }

  await disconnectStoreIntegration(String(partner.id), platform);
  revalidatePath(PARTNER_AFFILIATE_PROGRAM_PATH);
}
