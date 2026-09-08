"use server";

import { isSupabaseConfigured } from "@/lib/auth";
import { isUniqueConstraintError } from "@/lib/contact/reference-number";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type VaultMarketLaunchAlertResult =
  | { success: true; alreadySubscribed?: boolean }
  | { error: string };

export async function requestVaultMarketLaunchAlert(
  emailInput: string
): Promise<VaultMarketLaunchAlertResult> {
  const email = emailInput.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const admin = createAdminClient();
  const supabase = admin ?? (isSupabaseConfigured() ? await createClient() : null);
  if (!supabase) {
    return { error: "We couldn't save your alert right now. Please try again shortly." };
  }

  let memberId: string | null = null;
  try {
    const sessionClient = await createClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();
    if (user?.id) memberId = user.id;
  } catch {
    memberId = null;
  }

  const { error } = await supabase.from("foodvault_vault_market_launch_alerts").insert({
    email,
    member_id: memberId,
    source: "homepage_banner",
  });

  if (!error) {
    return { success: true };
  }

  if (isUniqueConstraintError(error)) {
    return { success: true, alreadySubscribed: true };
  }

  console.error("[vault-market] Failed to save launch alert", error);
  return { error: "We couldn't save your alert right now. Please try again shortly." };
}
