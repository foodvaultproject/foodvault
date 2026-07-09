import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_MEMBERSHIP_PRICE_MONTHLY,
  DEFAULT_PLATFORM_NAME,
  DEFAULT_SUPPORT_EMAIL,
  DEFAULT_TRIAL_LENGTH_DAYS,
  type SystemSettingsRow,
} from "@/lib/system-settings";

const FULL_SETTINGS_SELECT =
  "platform_name, membership_price_monthly, trial_length_days, support_email, homepage_headline, homepage_subheading, updated_at";

const CORE_SETTINGS_SELECT = "membership_price_monthly, trial_length_days, updated_at";

function isMissingColumnError(error: { message?: string } | null) {
  if (!error?.message) return false;
  return /could not find the .* column|schema cache/i.test(error.message);
}

/** Prefer service role on the server so public pages can read pricing settings. */
export async function createSettingsReadClient(): Promise<SupabaseClient> {
  return createAdminClient() ?? (await createClient());
}

async function queryLatestSettingsRow<T extends string>(
  supabase: SupabaseClient,
  select: T
): Promise<{ data: SystemSettingsRow | null; error: { message?: string } | null }> {
  const ordered = await supabase
    .from("system_settings")
    .select(select)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (!ordered.error && ordered.data) {
    return { data: ordered.data as SystemSettingsRow, error: null };
  }

  if (ordered.error && !isMissingColumnError(ordered.error)) {
    const plain = await supabase
      .from("system_settings")
      .select(select)
      .limit(1)
      .maybeSingle();

    if (!plain.error && plain.data) {
      return { data: plain.data as SystemSettingsRow, error: null };
    }

    return { data: null, error: plain.error ?? ordered.error };
  }

  const fallbackSelect = select
    .split(",")
    .map((column) => column.trim())
    .filter((column) => column !== "updated_at")
    .join(", ");

  if (fallbackSelect === select) {
    return { data: null, error: ordered.error };
  }

  const fallback = await supabase
    .from("system_settings")
    .select(fallbackSelect)
    .limit(1)
    .maybeSingle();

  if (!fallback.error && fallback.data) {
    return { data: fallback.data as SystemSettingsRow, error: null };
  }

  return { data: null, error: fallback.error ?? ordered.error };
}

export async function fetchSystemSettingsRow(
  supabase: SupabaseClient
): Promise<SystemSettingsRow | null> {
  for (const select of [FULL_SETTINGS_SELECT, CORE_SETTINGS_SELECT, "membership_price_monthly, trial_length_days"]) {
    const { data, error } = await queryLatestSettingsRow(supabase, select);
    if (data) {
      return data;
    }
    if (error && !isMissingColumnError(error)) {
      continue;
    }
  }

  return null;
}

export async function updateSystemSettingsRow(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<{ error?: string }> {
  const corePayload = {
    membership_price_monthly: payload.membership_price_monthly,
    trial_length_days: payload.trial_length_days,
  };

  const { data: existingRows, error: readError } = await supabase
    .from("system_settings")
    .select("id");

  if (readError) {
    return { error: readError.message };
  }

  if (!existingRows?.length) {
    const { error: insertError } = await supabase.from("system_settings").insert({
      membership_price_monthly:
        payload.membership_price_monthly ?? DEFAULT_MEMBERSHIP_PRICE_MONTHLY,
      trial_length_days: payload.trial_length_days ?? DEFAULT_TRIAL_LENGTH_DAYS,
      platform_name: payload.platform_name ?? DEFAULT_PLATFORM_NAME,
      support_email: payload.support_email ?? DEFAULT_SUPPORT_EMAIL,
      updated_at: payload.updated_at ?? new Date().toISOString(),
    });

    if (insertError) {
      return { error: insertError.message };
    }
  } else {
    const { error: coreError } = await supabase
      .from("system_settings")
      .update(corePayload)
      .not("id", "is", null);

    if (coreError) {
      return { error: coreError.message };
    }
  }

  const adminPayload: Record<string, unknown> = {};
  if (payload.platform_name !== undefined) adminPayload.platform_name = payload.platform_name;
  if (payload.support_email !== undefined) adminPayload.support_email = payload.support_email;
  if (payload.homepage_headline !== undefined) {
    adminPayload.homepage_headline = payload.homepage_headline;
  }
  if (payload.homepage_subheading !== undefined) {
    adminPayload.homepage_subheading = payload.homepage_subheading;
  }
  if (payload.updated_at !== undefined) adminPayload.updated_at = payload.updated_at;

  if (Object.keys(adminPayload).length === 0) {
    return {};
  }

  const { error: adminError } = await supabase
    .from("system_settings")
    .update(adminPayload)
    .not("id", "is", null);

  if (adminError && !isMissingColumnError(adminError)) {
    return { error: adminError.message };
  }

  return {};
}

export async function updateHomepageSettingsRow(
  supabase: SupabaseClient,
  payload: {
    homepage_headline: string;
    homepage_subheading: string;
    updated_at: string;
  }
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("system_settings")
    .update(payload)
    .not("id", "is", null);

  if (error && !isMissingColumnError(error)) {
    return { error: error.message };
  }

  return {};
}
