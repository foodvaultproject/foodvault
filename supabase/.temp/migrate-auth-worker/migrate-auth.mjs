import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SOURCE_REF = "aqofnwfgrhwiupdxwbpx";
const TARGET_REF = "ujsuhujujdowqpmertmt";
const OUTPUT_SQL = join(dirname(fileURLToPath(import.meta.url)), "..", "auth_data.sql");

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
  const escaped = sql.replace(/"/g, '\\"');
  const output = run(`npx supabase db query --linked --output-format json "${escaped}"`);
  const match = output.match(/\{[\s\S]*"rows"\s*:\s*\[[\s\S]*\]\s*,[\s\S]*\}/);
  if (!match) {
    throw new Error("Failed to parse supabase db query output");
  }
  return JSON.parse(match[0]).rows;
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return `'${value}'`;
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

const GENERATED_COLUMNS = {
  "auth.users": new Set(["confirmed_at"]),
  "auth.identities": new Set(["email"]),
};

function buildInsert(table, row) {
  const skip = GENERATED_COLUMNS[table] ?? new Set();
  const columns = Object.keys(row).filter((column) => !skip.has(column));
  const values = columns.map((column) => sqlLiteral(row[column]));
  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});`;
}

function exportTable(table) {
  const rows = supabaseQuery(`SELECT to_jsonb(t) AS row FROM ${table} AS t ORDER BY 1`);
  return rows.map(({ row }) => buildInsert(table, row));
}

function main() {
  console.log(`Exporting auth data from ${SOURCE_REF}...`);
  linkProject(SOURCE_REF);

  const users = supabaseQuery("SELECT COUNT(*)::int AS count FROM auth.users")[0].count;
  const identities = supabaseQuery("SELECT COUNT(*)::int AS count FROM auth.identities")[0].count;
  console.log(`Source has ${users} users and ${identities} identities.`);

  const userStatements = exportTable("auth.users");
  const identityStatements = exportTable("auth.identities");

  const usersSql = join(dirname(fileURLToPath(import.meta.url)), "..", "auth_users.sql");
  const identitiesSql = join(dirname(fileURLToPath(import.meta.url)), "..", "auth_identities.sql");

  writeFileSync(
    usersSql,
    ["SET session_replication_role = replica;", ...userStatements, "RESET ALL;"].join("\n") + "\n",
    "utf8"
  );
  writeFileSync(
    identitiesSql,
    ["SET session_replication_role = replica;", ...identityStatements, "RESET ALL;"].join("\n") + "\n",
    "utf8"
  );
  writeFileSync(
    OUTPUT_SQL,
    [
      "-- Auth migration export generated for FoodVault California -> Sydney",
      ...userStatements,
      ...identityStatements,
    ].join("\n") + "\n",
    "utf8"
  );
  console.log(`Wrote auth export SQL (${userStatements.length} users, ${identityStatements.length} identities).`);

  console.log(`Importing auth data into ${TARGET_REF}...`);
  linkProject(TARGET_REF);

  const existing = supabaseQuery("SELECT COUNT(*)::int AS count FROM auth.users")[0].count;
  if (existing > 0) {
    throw new Error(`Target auth.users is not empty (${existing} rows). Aborting import.`);
  }

  const usersPath = usersSql.replace(/\\/g, "/");
  const identitiesPath = identitiesSql.replace(/\\/g, "/");
  run(`npx supabase db query --linked --file "${usersPath}"`);
  run(`npx supabase db query --linked --file "${identitiesPath}"`);

  const importedUsers = supabaseQuery("SELECT COUNT(*)::int AS count FROM auth.users")[0].count;
  const importedIdentities = supabaseQuery("SELECT COUNT(*)::int AS count FROM auth.identities")[0].count;
  console.log(
    `Import complete. Sydney now has ${importedUsers} auth users and ${importedIdentities} identities.`
  );

  linkProject(TARGET_REF);
}

main();
