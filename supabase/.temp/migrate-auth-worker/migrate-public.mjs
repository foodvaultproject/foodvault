import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SOURCE_REF = "aqofnwfgrhwiupdxwbpx";
const TARGET_REF = "ujsuhujujdowqpmertmt";
const TEMP_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXPORT_DIR = join(TEMP_DIR, "public_export");

const SKIP_TABLES = new Set(["categories", "system_settings"]);
const IMPORT_ORDER = [
  "admin_users",
  "members",
  "partners",
  "memberships",
  "discover_articles",
  "member_favorites",
  "brand_reports",
  "brand_report_events",
];
const GENERATED_COLUMNS = {
  partners: new Set(["slug", "search_document"]),
};

function run(cmd) {
  return execSync(cmd, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function linkProject(projectRef) {
  run(`npx supabase link --project-ref ${projectRef} --yes`);
}

function supabaseQuery(sql) {
  const oneLine = sql.replace(/\s+/g, " ").trim();
  const output = run(
    `npx supabase db query --linked --output-format json "${oneLine.replace(/"/g, '\\"')}"`
  );
  const match = output.match(/\{[\s\S]*"rows"\s*:\s*\[[\s\S]*\]\s*,[\s\S]*\}/);
  if (!match) throw new Error("Failed to parse supabase db query output");
  return JSON.parse(match[0]).rows;
}

function getColumnTypes(table) {
  return Object.fromEntries(
    supabaseQuery(
      `SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}'`
    ).map((row) => [row.column_name, row])
  );
}

function sqlLiteral(value, columnMeta = null) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";

  const dataType = columnMeta?.data_type;
  const udtName = columnMeta?.udt_name;

  if (dataType === "jsonb" || udtName === "jsonb") {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }

  if (dataType === "ARRAY" || udtName === "_text") {
    if (!Array.isArray(value) || value.length === 0) return "ARRAY[]::text[]";
    return `ARRAY[${value.map((item) => sqlLiteral(item)).join(", ")}]::text[]`;
  }

  if (udtName === "tsvector") {
    return `'${String(value).replace(/'/g, "''")}'::tsvector`;
  }

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return `'${value}'`;
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (Array.isArray(value)) {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function listPublicTables() {
  return supabaseQuery(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name"
  ).map((row) => row.table_name);
}

function tableExists(table) {
  const [{ exists }] = supabaseQuery(
    `SELECT to_regclass('public.${table}') IS NOT NULL AS exists`
  );
  return exists;
}

function getTableColumns(table) {
  return new Set(
    supabaseQuery(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' ORDER BY ordinal_position`
    ).map((row) => row.column_name)
  );
}

function tableCount(table) {
  const [{ count }] = supabaseQuery(`SELECT COUNT(*)::int AS count FROM public.${table}`);
  return count;
}

function exportRows(table) {
  return supabaseQuery(`SELECT to_jsonb(t) AS row FROM public.${table} AS t ORDER BY 1`).map(
    ({ row }) => row
  );
}

function normalizeRow(table, row, authEmailToId) {
  const normalized = { ...row };

  if (table === "admin_users") {
    if (!normalized.auth_user_id && normalized.email) {
      normalized.auth_user_id = authEmailToId[normalized.email] ?? null;
    }
    if (!normalized.full_name) {
      normalized.full_name = normalized.name ?? normalized.email ?? "Administrator";
    }
    if (!normalized.role) {
      normalized.role = "Administrator";
    }
  }

  if (table === "members" && normalized.user_id && !normalized.auth_user_id) {
    normalized.auth_user_id = normalized.user_id;
  }

  if (table === "partners" && normalized.auth_user_id && !normalized.user_id) {
    normalized.user_id = normalized.auth_user_id;
  }

  return normalized;
}

function buildInsert(table, row, targetColumns, columnTypes, authEmailToId) {
  const normalized = normalizeRow(table, row, authEmailToId);
  const skip = GENERATED_COLUMNS[table] ?? new Set();
  const columns = Object.keys(normalized).filter(
    (column) => targetColumns.has(column) && !skip.has(column)
  );
  const values = columns.map((column) => sqlLiteral(normalized[column], columnTypes[column]));
  return `INSERT INTO public.${table} (${columns.join(", ")}) VALUES (${values.join(", ")});`;
}

function buildImportSql(table, rows, targetColumns, columnTypes, authEmailToId) {
  return [
    "SET session_replication_role = replica;",
    ...rows.map((row) => buildInsert(table, row, targetColumns, columnTypes, authEmailToId)),
    "RESET ALL;",
  ].join("\n");
}

function applyMappedSystemSettings(rows) {
  const byKey = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const membershipPrice = byKey.membership_price_monthly ?? "9.99";
  const trialDays = byKey.trial_length_days ?? "7";
  const platformName = byKey.platform_name ?? "FoodVault";
  const supportEmail = byKey.support_email ?? "support@foodvault.co.nz";
  const headline = byKey.homepage_hero_headline ?? null;
  const subheading = byKey.homepage_hero_subheading ?? null;

  return [
    "SET session_replication_role = replica;",
    `UPDATE public.system_settings SET`,
    `  membership_price_monthly = ${membershipPrice},`,
    `  trial_length_days = ${trialDays},`,
    `  platform_name = ${sqlLiteral(platformName)},`,
    `  support_email = ${sqlLiteral(supportEmail)},`,
    headline ? `  homepage_headline = ${sqlLiteral(headline)},` : null,
    subheading ? `  homepage_subheading = ${sqlLiteral(subheading)},` : null,
    `  updated_at = now()`,
    `WHERE id = 1;`,
    "RESET ALL;",
  ]
    .filter(Boolean)
    .join("\n");
}

function compareCounts(sourceCounts, migratedTables, targetCounts) {
  const discrepancies = [];
  for (const table of migratedTables) {
    const source = sourceCounts[table] ?? 0;
    const target = targetCounts[table];
    if (target === null) {
      discrepancies.push({ table, source, target: "missing_table", reason: "Table not present on Sydney" });
      continue;
    }
    if (source !== target) {
      discrepancies.push({ table, source, target });
    }
  }
  return discrepancies;
}

function loadCachedExport(table) {
  const path = join(EXPORT_DIR, `${table}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function main() {
  const importOnly = process.argv.includes("--import-only");
  mkdirSync(EXPORT_DIR, { recursive: true });

  let exportData = {};
  let sourceCounts = {};

  if (importOnly) {
    console.log("Using cached California exports from public_export/*.json");
    for (const table of [...IMPORT_ORDER, ...SKIP_TABLES]) {
      const rows = loadCachedExport(table);
      if (rows) {
        exportData[table] = rows;
        sourceCounts[table] = rows.length;
        console.log(`Loaded ${table}: ${rows.length} rows`);
      }
    }
  } else {
    console.log(`Auditing public tables on ${SOURCE_REF}...`);
    linkProject(SOURCE_REF);
    const sourceTables = IMPORT_ORDER.concat([...SKIP_TABLES]);
    for (const table of sourceTables) {
      if (!tableExists(table)) continue;
      const count = tableCount(table);
      sourceCounts[table] = count;
      if (count > 0) {
        exportData[table] = exportRows(table);
        writeFileSync(
          join(EXPORT_DIR, `${table}.json`),
          JSON.stringify(exportData[table], null, 2),
          "utf8"
        );
        console.log(`Exported ${table}: ${count} rows`);
      }
    }
  }

  const tablesToMigrate = IMPORT_ORDER.filter(
    (table) => exportData[table] && !SKIP_TABLES.has(table)
  );
  console.log(`Preparing import for ${tablesToMigrate.length} tables (skipping ${[...SKIP_TABLES].join(", ")}).`);

  console.log(`Importing public data into ${TARGET_REF}...`);
  linkProject(TARGET_REF);
  const authEmailToId = Object.fromEntries(
    supabaseQuery("SELECT id, email FROM auth.users").map((row) => [row.email, row.id])
  );

  const targetColumnsByTable = {};
  const columnTypesByTable = {};
  for (const table of tablesToMigrate) {
    if (!tableExists(table)) {
      console.log(`Skipping ${table}: missing on target.`);
      continue;
    }
    targetColumnsByTable[table] = getTableColumns(table);
    columnTypesByTable[table] = getColumnTypes(table);
    if (tableCount(table) > 0) {
      run(
        `npx supabase db query --linked --output-format json "DELETE FROM public.${table};"`
      );
      console.log(`Cleared ${table} on target.`);
    }
  }

  for (const table of tablesToMigrate) {
    const targetColumns = targetColumnsByTable[table];
    if (!targetColumns) continue;
    const importRows = exportData[table].filter((row) => {
      if (table !== "admin_users") return true;
      const normalized = normalizeRow(table, row, authEmailToId);
      if (normalized.auth_user_id) return true;
      console.log(`Skipping admin_users row without auth_user_id: ${row.email}`);
      return false;
    });
    const importSql = buildImportSql(
      table,
      importRows,
      targetColumns,
      columnTypesByTable[table],
      authEmailToId
    );
    const importPath = join(EXPORT_DIR, `${table}_import.sql`);
    writeFileSync(importPath, `${importSql}\n`, "utf8");
    run(`npx supabase db query --linked --file "${importPath.replace(/\\/g, "/")}"`);
    console.log(`Imported ${table}: ${importRows.length} rows`);
  }

  if (exportData.system_settings && tableExists("system_settings")) {
    const settingsSql = applyMappedSystemSettings(exportData.system_settings);
    const settingsPath = join(EXPORT_DIR, "system_settings_mapped.sql");
    writeFileSync(settingsPath, `${settingsSql}\n`, "utf8");
    run(`npx supabase db query --linked --file "${settingsPath.replace(/\\/g, "/")}"`);
    console.log("Applied mapped system_settings values to Sydney singleton row.");
  }

  const targetCounts = {};
  for (const table of Object.keys(exportData)) {
    targetCounts[table] = tableExists(table) ? tableCount(table) : null;
  }

  const migratedTables = tablesToMigrate.filter((table) => targetColumnsByTable[table]);
  const discrepancies = compareCounts(sourceCounts, migratedTables, targetCounts);

  if (SKIP_TABLES.has("categories") && (sourceCounts.categories ?? 0) > 0) {
    discrepancies.push({
      table: "categories",
      source: sourceCounts.categories,
      target: 0,
      reason: "California legacy table not present in Sydney migrations",
    });
  }

  if (exportData.system_settings) {
    discrepancies.push({
      table: "system_settings",
      source: sourceCounts.system_settings,
      target: targetCounts.system_settings,
      reason: "Schema differs (California key-value rows mapped to Sydney singleton id=1)",
      mapped: true,
    });
  }

  const report = { sourceCounts, targetCounts, discrepancies, migratedTables };
  writeFileSync(join(TEMP_DIR, "public_migration_report.json"), JSON.stringify(report, null, 2), "utf8");

  const hardFailures = discrepancies.filter(
    (item) => !item.mapped && item.target !== item.source
  );

  if (hardFailures.length > 0) {
    console.log("ROW COUNT DISCREPANCIES:");
    for (const item of hardFailures) {
      console.log(
        `  ${item.table}: source=${item.source}, target=${item.target}${item.reason ? ` (${item.reason})` : ""}`
      );
    }
  } else {
    console.log("Row counts match for all migrated tables.");
  }

  if (discrepancies.some((item) => item.mapped || item.reason)) {
    console.log("NOTES:");
    for (const item of discrepancies.filter((d) => d.mapped || d.reason)) {
      console.log(`  ${item.table}: ${item.reason}`);
    }
  }

  const orphanPartners = supabaseQuery(
    "SELECT COUNT(*)::int AS count FROM public.partners p LEFT JOIN auth.users u ON u.id = p.user_id WHERE p.user_id IS NOT NULL AND u.id IS NULL"
  )[0].count;

  if (orphanPartners > 0) {
    console.log(`WARNING: ${orphanPartners} partner rows have no matching auth.users record.`);
    process.exitCode = 1;
  } else {
    console.log("Partner -> auth.users linkage validated (0 orphans).");
  }

  linkProject(TARGET_REF);
}

main();
