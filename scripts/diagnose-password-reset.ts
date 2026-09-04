/**
 * Look up one auth/member record and test generateLink recovery.
 * Does not send Resend mail. Does not print secrets.
 *
 *   npx tsx scripts/diagnose-password-reset.ts mark+test2@benchmark-int.com
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function redactEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return "(invalid)";
  return `${local.slice(0, 2)}…@${domain}`;
}

async function main() {
  loadEnvLocal();
  const email = (process.argv[2] ?? "").trim();
  if (!email) {
    console.error("Usage: npx tsx scripts/diagnose-password-reset.ts email@example.com");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("Missing Supabase admin env.");
    process.exit(1);
  }

  console.log(`Target: ${redactEmail(email)}`);
  console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "SET" : "MISSING"}`);
  console.log(
    `NOTIFICATION_FROM_EMAIL: ${process.env.NOTIFICATION_FROM_EMAIL || "(default notifications@)"}`
  );
  console.log("");

  const headers = {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
    "Content-Type": "application/json",
  };

  const rpc = await fetch(`${url}/rest/v1/rpc/admin_get_auth_user_by_email`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ p_email: email }),
  });
  const rpcText = await rpc.text();
  let rpcJson: unknown = null;
  try {
    rpcJson = rpcText ? JSON.parse(rpcText) : null;
  } catch {
    rpcJson = rpcText.slice(0, 200);
  }
  console.log(`RPC admin_get_auth_user_by_email status=${rpc.status}`);
  if (rpcJson && typeof rpcJson === "object" && !Array.isArray(rpcJson)) {
    const row = rpcJson as Record<string, unknown>;
    console.log(`  found=${Boolean(row.id)}`);
    console.log(`  hasEmail=${Boolean(row.email)}`);
    console.log(`  emailConfirmed=${Boolean(row.email_confirmed_at)}`);
    console.log(`  metadataKeys=${Object.keys((row.user_metadata as object) ?? {}).join(",")}`);
  } else {
    console.log(`  body=${JSON.stringify(rpcJson).slice(0, 300)}`);
  }

  const member = await fetch(
    `${url}/rest/v1/members?select=id,email,auth_user_id,status,membership_status,subscription_status&email=ilike.${encodeURIComponent(email)}`,
    { headers }
  );
  const members = (await member.json()) as unknown;
  console.log(`members lookup status=${member.status}`);
  if (Array.isArray(members)) {
    console.log(`  rows=${members.length}`);
    for (const row of members) {
      const r = row as Record<string, unknown>;
      console.log(
        `  status=${r.status} membership=${r.membership_status} subscription=${r.subscription_status} hasAuthUserId=${Boolean(r.auth_user_id)}`
      );
    }
  } else {
    console.log(`  body=${JSON.stringify(members).slice(0, 300)}`);
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.foodvault.co.nz").replace(
    /\/$/,
    ""
  );
  const link = await fetch(`${url}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "recovery",
      email,
      redirect_to: `${site}/auth/confirm`,
    }),
  });
  const linkText = await link.text();
  let linkJson: Record<string, unknown> = {};
  try {
    linkJson = linkText ? (JSON.parse(linkText) as Record<string, unknown>) : {};
  } catch {
    linkJson = { raw: linkText.slice(0, 240) };
  }
  const properties =
    linkJson.properties && typeof linkJson.properties === "object"
      ? (linkJson.properties as Record<string, unknown>)
      : linkJson;

  console.log(`generateLink.recovery status=${link.status} ok=${link.ok}`);
  console.log(`  hashed_token=${properties.hashed_token ? "present" : "missing"}`);
  console.log(`  action_link=${properties.action_link ? "present" : "missing"}`);
  console.log(`  verification_type=${String(properties.verification_type ?? "")}`);
  if (!link.ok) {
    console.log(
      `  error=${String(linkJson.msg ?? linkJson.message ?? linkJson.error_description ?? JSON.stringify(linkJson).slice(0, 400))}`
    );
    console.log(`  error_code=${String(linkJson.error_code ?? linkJson.code ?? "")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
