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

const KEY_VALUE_SELECT = "key, value, trial_length_days, membership_price_monthly, platform_name, support_email, homepage_headline, homepage_subheading, updated_at";

const KEY_VALUE_SETTING_FIELDS = new Set([
  "platform_name",
  "membership_price_monthly",
  "trial_length_days",
  "support_email",
  "homepage_headline",
  "homepage_subheading",
]);

function isMissingColumnError(error: { message?: string } | null) {
  if (!error?.message) return false;
  return /could not find the .* column|schema cache/i.test(error.message);
}

function mergeSettingsRows(
  ...rows: Array<SystemSettingsRow | null | undefined>
): SystemSettingsRow | null {
  const merged: SystemSettingsRow = {};

  for (const row of rows) {
    if (!row) continue;

    for (const [field, value] of Object.entries(row)) {
      if (
        value == null ||
        value === "" ||
        field === "key" ||
        field === "value" ||
        field === "id" ||
        field === "updated_at"
      ) {
        continue;
      }

      merged[field as keyof SystemSettingsRow] = value as never;
    }
  }

  // Key-value `value` fields only fill gaps — column values from admin saves win.
  for (const row of rows) {
    if (!row) continue;

    const settingKey = row.key?.trim();
    if (
      settingKey &&
      KEY_VALUE_SETTING_FIELDS.has(settingKey) &&
      row.value != null &&
      row.value !== "" &&
      merged[settingKey as keyof SystemSettingsRow] == null
    ) {
      merged[settingKey as keyof SystemSettingsRow] = row.value as never;
    }
  }

  return Object.keys(merged).length > 0 ? merged : null;
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

async function fetchSingletonSettingsRow(
  supabase: SupabaseClient
): Promise<SystemSettingsRow | null> {
  for (const select of [FULL_SETTINGS_SELECT, CORE_SETTINGS_SELECT]) {
    const { data, error } = await supabase
      .from("system_settings")
      .select(select)
      .eq("id", 1)
      .maybeSingle();

    if (!error && data) {
      return data as SystemSettingsRow;
    }

    if (error && !isMissingColumnError(error)) {
      break;
    }
  }

  return null;
}

async function fetchKeyValueSettingsRows(
  supabase: SupabaseClient
): Promise<SystemSettingsRow[]> {
  const { data, error } = await supabase
    .from("system_settings")
    .select(KEY_VALUE_SELECT)
    .not("key", "is", null);

  if (error || !data?.length) {
    return [];
  }

  return data as SystemSettingsRow[];
}

async function fetchDedicatedCoreSettingsRow(
  supabase: SupabaseClient
): Promise<SystemSettingsRow | null> {
  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value, membership_price_monthly, trial_length_days, updated_at")
    .in("key", ["membership_price_monthly", "trial_length_days"]);

  if (error || !data?.length) {
    return null;
  }

  const merged: SystemSettingsRow = {};

  for (const row of data as SystemSettingsRow[]) {
    const key = row.key?.trim();
    if (
      key === "membership_price_monthly" &&
      row.membership_price_monthly != null
    ) {
      merged.membership_price_monthly = row.membership_price_monthly;
    }
    if (key === "trial_length_days" && row.trial_length_days != null) {
      merged.trial_length_days = row.trial_length_days;
    }
  }

  return Object.keys(merged).length > 0 ? merged : null;
}

export async function fetchSystemSettingsRow(
  supabase: SupabaseClient
): Promise<SystemSettingsRow | null> {
  const [singleton, keyValueRows, latest, dedicatedCore] = await Promise.all([
    fetchSingletonSettingsRow(supabase),
    fetchKeyValueSettingsRows(supabase),
    queryLatestSettingsRow(supabase, FULL_SETTINGS_SELECT),
    fetchDedicatedCoreSettingsRow(supabase),
  ]);

  const merged = mergeSettingsRows(
    ...keyValueRows,
    latest.data ?? undefined,
    dedicatedCore ?? undefined,
    singleton
  );

  if (merged) {
    return merged;
  }

  for (const select of [CORE_SETTINGS_SELECT, "membership_price_monthly, trial_length_days"]) {
    const { data } = await queryLatestSettingsRow(supabase, select);
    if (data) {
      return data;
    }
  }

  return null;
}

async function syncKeyValueSetting(
  supabase: SupabaseClient,
  key: string,
  value: string | number
) {
  const { error } = await supabase
    .from("system_settings")
    .update({
      value: String(value),
      updated_at: new Date().toISOString(),
    })
    .eq("key", key);

  if (error && !isMissingColumnError(error)) {
    return error;
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
    updated_at: payload.updated_at ?? new Date().toISOString(),
  };

  const { data: existingRows, error: readError } = await supabase
    .from("system_settings")
    .select("id");

  if (readError) {
    return { error: readError.message };
  }

  if (!existingRows?.length) {
    const { error: insertError } = await supabase.from("system_settings").insert({
      id: 1,
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
    const { error: singletonError } = await supabase
      .from("system_settings")
      .update(corePayload)
      .eq("id", 1);

    if (singletonError && !isMissingColumnError(singletonError)) {
      return { error: singletonError.message };
    }

    const { error: coreError } = await supabase
      .from("system_settings")
      .update(corePayload)
      .not("id", "is", null);

    if (coreError) {
      return { error: coreError.message };
    }
  }

  if (payload.trial_length_days !== undefined) {
    const keyError = await syncKeyValueSetting(
      supabase,
      "trial_length_days",
      payload.trial_length_days as number
    );
    if (keyError) {
      return { error: keyError.message };
    }
  }

  if (payload.membership_price_monthly !== undefined) {
    const keyError = await syncKeyValueSetting(
      supabase,
      "membership_price_monthly",
      payload.membership_price_monthly as number
    );
    if (keyError) {
      return { error: keyError.message };
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
