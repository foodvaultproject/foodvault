/**
 * Diagnose why /pricing may show $20 instead of admin system settings.
 *
 * Run from project root:
 *   npm run diagnose:settings
 *
 * Uses .env.local. Does not print secret keys or unrelated columns.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  DEFAULT_MEMBERSHIP_PRICE_MONTHLY,
  DEFAULT_TRIAL_LENGTH_DAYS,
  parseSystemSettingsRow,
} from "../src/lib/system-settings";
import {
  formatMembershipPrice,
  formatMembershipPriceMonthly,
} from "../src/lib/member/pricing";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.warn("No .env.local found — using process.env only.");
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

function maskSecret(value: string | undefined) {
  if (!value) return "(missing)";
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}…${value.slice(-4)} (${value.length} chars)`;
}

function supabaseHost(url: string | undefined) {
  if (!url) return "(missing)";
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

type SettingsRow = {
  id?: unknown;
  key?: unknown;
  value?: unknown;
  membership_price_monthly?: unknown;
  trial_length_days?: unknown;
  updated_at?: unknown;
};

type RestResult = {
  rows: SettingsRow[];
  error: string | null;
  status: number;
  hasKeyColumn: boolean;
};

async function restQuery(url: string, apiKey: string, path: string): Promise<RestResult> {
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/${path}`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();
  const hasKeyColumn = !/column system_settings\.key does not exist/i.test(text);

  if (!response.ok) {
    return {
      rows: [],
      error: text || response.statusText,
      status: response.status,
      hasKeyColumn,
    };
  }

  try {
    const parsed = JSON.parse(text) as SettingsRow[];
    return {
      rows: Array.isArray(parsed) ? parsed : [],
      error: null,
      status: response.status,
      hasKeyColumn,
    };
  } catch {
    return {
      rows: [],
      error: "Invalid JSON response",
      status: response.status,
      hasKeyColumn,
    };
  }
}

function summarizeRow(row: SettingsRow | null | undefined) {
  if (!row) return null;
  return {
    id: row.id ?? null,
    key: row.key ?? null,
    value: row.value ?? null,
    membership_price_monthly: row.membership_price_monthly ?? null,
    trial_length_days: row.trial_length_days ?? null,
    updated_at: row.updated_at ?? null,
  };
}

function resolvePriceFromRows(rows: SettingsRow[]) {
  const singleton = rows.find((row) => String(row.id) === "1") ?? rows[0] ?? null;
  const keyRow = rows.find((row) => row.key === "membership_price_monthly") ?? null;

  const fromSingleton = Number(singleton?.membership_price_monthly);
  const fromKeyColumn = Number(keyRow?.membership_price_monthly);
  const fromKeyValueRaw = String(keyRow?.value ?? "").trim();
  const fromKeyValue =
    fromKeyValueRaw === "" ? Number.NaN : Number(fromKeyValueRaw);

  const resolved: number | null =
    [fromKeyColumn, fromKeyValue, fromSingleton].find((n) =>
      Number.isFinite(n)
    ) ?? null;

  return {
    singleton: summarizeRow(singleton),
    keyRow: summarizeRow(keyRow),
    resolved,
  };
}

async function diagnoseKey(label: string, url: string, apiKey: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(label);
  console.log("=".repeat(60));

  const coreSelect =
    "id,membership_price_monthly,trial_length_days,updated_at";
  const withKeySelect =
    "id,key,value,membership_price_monthly,trial_length_days,updated_at";

  let schema: "singleton" | "key-value" = "singleton";
  let allRows = await restQuery(url, apiKey, `system_settings?select=${coreSelect}`);

  if (allRows.error && /column system_settings\.key does not exist/i.test(allRows.error)) {
    schema = "singleton";
    allRows = await restQuery(url, apiKey, `system_settings?select=${coreSelect}`);
  } else if (!allRows.error) {
    const keyProbe = await restQuery(
      url,
      apiKey,
      `system_settings?select=${withKeySelect}&limit=1`
    );
    schema = keyProbe.error ? "singleton" : "key-value";
    if (schema === "key-value") {
      allRows = await restQuery(url, apiKey, `system_settings?select=${withKeySelect}`);
    }
  }

  console.log("Detected schema:", schema);

  if (allRows.error) {
    console.log("ERROR reading system_settings:", allRows.error);
    return parseSystemSettingsRow(null);
  }

  console.log(`Rows visible to this key: ${allRows.rows.length}`);
  for (const row of allRows.rows) {
    console.log(" ", JSON.stringify(summarizeRow(row)));
  }

  const id1 = await restQuery(
    url,
    apiKey,
    `system_settings?select=${schema === "key-value" ? withKeySelect : coreSelect}&id=eq.1`
  );
  console.log("\n[id = 1]");
  if (id1.error) {
    console.log("  ERROR:", id1.error);
  } else if (!id1.rows.length) {
    console.log("  (no row with id = 1)");
  } else {
    console.log(" ", JSON.stringify(summarizeRow(id1.rows[0])));
  }

  if (schema === "key-value") {
    const priceKey = await restQuery(
      url,
      apiKey,
      `system_settings?select=${withKeySelect}&key=eq.membership_price_monthly`
    );
    console.log("\n[key = membership_price_monthly]");
    if (priceKey.error) {
      console.log("  ERROR:", priceKey.error);
    } else if (!priceKey.rows.length) {
      console.log("  (missing canonical key row)");
    } else {
      console.log(" ", JSON.stringify(summarizeRow(priceKey.rows[0])));
    }
  }

  const toNumberOrNull = (value: unknown): number | null => {
    if (value == null || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const priceResolution = resolvePriceFromRows(allRows.rows);
  const parsed = parseSystemSettingsRow({
    membership_price_monthly:
      priceResolution.resolved ??
      toNumberOrNull(id1.rows[0]?.membership_price_monthly),
    trial_length_days:
      toNumberOrNull(id1.rows[0]?.trial_length_days) ??
      toNumberOrNull(allRows.rows[0]?.trial_length_days),
  });

  console.log("\n[What /pricing would use]");
  console.log("  resolved price source:", JSON.stringify(priceResolution));
  console.log("  parsed membership_price_monthly:", parsed.membership_price_monthly);
  console.log("  parsed trial_length_days:", parsed.trial_length_days);
  console.log(
    "  hero display:",
    formatMembershipPrice(parsed.membership_price_monthly),
    "/ month (",
    formatMembershipPriceMonthly(parsed.membership_price_monthly),
    ")"
  );

  if (parsed.membership_price_monthly === DEFAULT_MEMBERSHIP_PRICE_MONTHLY) {
    if (!allRows.rows.length) {
      console.log("\n  ⚠ No readable settings rows — app falls back to $20 / 7 days.");
    } else {
      console.log(
        "\n  ⚠ Resolved price is still the code default ($20). DB row likely still has 20, not 8.99."
      );
    }
  } else if (parsed.membership_price_monthly === 8.99) {
    console.log("\n  ✓ Database resolves $8.99 — if live /pricing shows $20, check Vercel env/deploy.");
  }

  return parsed;
}

function printTroubleshooting(url: string | undefined, schemaNote: string) {
  console.log("\nLikely causes when /pricing shows $20:");
  console.log(`  1. ${schemaNote}`);
  console.log("  2. Admin save did not persist membership_price_monthly on id = 1");
  console.log("  3. Vercel env points at a different Supabase project than admin");
  console.log("  4. Live site not redeployed after settings merge fix");
  console.log("\nSuggested fixes:");
  console.log("  • Admin → System Settings → set $8.99 → Save → refresh admin page to confirm");
  console.log("  • Re-run this script — id = 1 should show membership_price_monthly: 8.99");
  console.log("  • Confirm Vercel Supabase host matches:", supabaseHost(url));
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("FoodVault membership settings diagnostic");
  console.log("========================================");
  console.log("Supabase host:", supabaseHost(url));
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", maskSecret(anonKey));
  console.log("SUPABASE_SERVICE_ROLE_KEY:", maskSecret(serviceKey));
  console.log(
    "Code defaults (fallback):",
    `$${DEFAULT_MEMBERSHIP_PRICE_MONTHLY}`,
    "/",
    DEFAULT_TRIAL_LENGTH_DAYS,
    "days"
  );

  if (!url || !anonKey) {
    console.error("\nMissing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    process.exit(1);
  }

  const anonParsed = await diagnoseKey("ANON KEY (public visitor)", url, anonKey);

  if (serviceKey) {
    const serviceParsed = await diagnoseKey(
      "SERVICE ROLE (server-side reader — same as getMembershipSettings when set)",
      url,
      serviceKey
    );

    console.log(`\n${"=".repeat(60)}`);
    console.log("COMPARISON");
    console.log("=".repeat(60));
    console.log("Anon price:", anonParsed.membership_price_monthly);
    console.log("Service price:", serviceParsed.membership_price_monthly);

    if (anonParsed.membership_price_monthly !== serviceParsed.membership_price_monthly) {
      console.log("\n⚠ Anon and service-role reads disagree — check RLS.");
    }

    if (serviceParsed.membership_price_monthly === DEFAULT_MEMBERSHIP_PRICE_MONTHLY) {
      printTroubleshooting(
        url,
        "Your DB uses a single system_settings row (id = 1) — price must live on that row"
      );
    }
    return;
  }

  console.log("\n⚠ SUPABASE_SERVICE_ROLE_KEY not set — only anon diagnostics ran.");
  if (anonParsed.membership_price_monthly === DEFAULT_MEMBERSHIP_PRICE_MONTHLY) {
    printTroubleshooting(
      url,
      "Your DB uses a single system_settings row (id = 1) — price must live on that row"
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
