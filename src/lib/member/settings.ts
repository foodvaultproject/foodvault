import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/auth";
import type { MembershipSettings } from "@/lib/member/pricing";
import {
  DEFAULT_SYSTEM_SETTINGS,
  parseSystemSettingsRow,
} from "@/lib/system-settings";
import { fetchSystemSettingsRow } from "@/lib/system-settings-db";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type { MembershipSettings } from "@/lib/member/pricing";

/** Prefer service role on the server so public pages can read pricing settings. */
async function createSettingsReadClient(): Promise<SupabaseClient> {
  return createAdminClient() ?? (await createClient());
}

const DEV_SETTINGS: MembershipSettings = {
  membershipPriceMonthly: DEFAULT_SYSTEM_SETTINGS.membership_price_monthly,
  trialLengthDays: DEFAULT_SYSTEM_SETTINGS.trial_length_days,
};

export async function getMembershipSettings(): Promise<MembershipSettings> {
  if (!isSupabaseConfigured()) {
    return DEV_SETTINGS;
  }

  const supabase = await createSettingsReadClient();
  const data = await fetchSystemSettingsRow(supabase);

  if (!data) {
    return DEV_SETTINGS;
  }

  const parsed = parseSystemSettingsRow(data);

  return {
    membershipPriceMonthly: parsed.membership_price_monthly,
    trialLengthDays: parsed.trial_length_days,
  };
}

export async function getPlatformSettings() {
  if (!isSupabaseConfigured()) {
    return DEFAULT_SYSTEM_SETTINGS;
  }

  const supabase = await createSettingsReadClient();
  const data = await fetchSystemSettingsRow(supabase);

  if (!data) {
    return DEFAULT_SYSTEM_SETTINGS;
  }

  return parseSystemSettingsRow(data);
}

/** Authenticated admin reads — cookie session is sufficient when service role is unavailable. */
export async function getSystemSettingsForAdmin() {
  if (!isSupabaseConfigured()) {
    return DEFAULT_SYSTEM_SETTINGS;
  }

  const supabase = await createClient();
  const data = await fetchSystemSettingsRow(supabase);

  if (!data) {
    return DEFAULT_SYSTEM_SETTINGS;
  }

  return parseSystemSettingsRow(data);
}
