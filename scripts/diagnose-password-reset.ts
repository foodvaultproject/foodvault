/**
 * Diagnose password-reset email wiring without printing secrets.
 *
 *   npx tsx scripts/diagnose-password-reset.ts [email]
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

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
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function reportEnv(name: string, revealPrefix = false) {
  const value = process.env[name] ?? "";
  if (!value) {
    console.log(`  ${name}: MISSING`);
    return;
  }
  const prefix = revealPrefix ? ` valuePrefix=${value.slice(0, 48)}` : "";
  console.log(`  ${name}: SET len=${value.length}${prefix}`);
}

async function main() {
  loadEnvLocal();

  const email = (process.argv[2] ?? "").trim().toLowerCase();

  console.log("Password reset diagnostic");
  reportEnv("RESEND_API_KEY");
  reportEnv("NOTIFICATION_FROM_EMAIL", true);
  reportEnv("NOTIFICATION_REPLY_TO_EMAIL", true);
  reportEnv("NEXT_PUBLIC_SITE_URL", true);
  reportEnv("NEXT_PUBLIC_SUPABASE_URL", true);
  reportEnv("SUPABASE_SERVICE_ROLE_KEY");
  reportEnv("UPSTASH_REDIS_REST_URL");
  reportEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
  console.log("");

  const resendKey = process.env.RESEND_API_KEY ?? "";
  if (resendKey) {
    const domains = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${resendKey}` },
    });
    const domainBody = await domains.json();
    console.log(`Resend /domains status=${domains.status}`);
    const list = Array.isArray(domainBody?.data) ? domainBody.data : [];
    for (const domain of list) {
      console.log(
        `  domain=${domain.name} status=${domain.status} region=${domain.region ?? "?"}`
      );
    }
    if (!list.length) {
      console.log(`  bodyKeys=${Object.keys(domainBody ?? {}).join(",")}`);
    }
  } else {
    console.log("Skipping Resend domain check — no API key.");
  }

  if (!email) {
    console.log("\nPass an email to also test generateLink recovery.");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.log("Cannot test generateLink — missing Supabase admin env.");
    return;
  }

  const response = await fetch(`${url}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "recovery",
      email,
      redirect_to: `${(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.foodvault.co.nz").replace(/\/$/, "")}/auth/confirm`,
    }),
  });

  const text = await response.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    parsed = { raw: text.slice(0, 200) };
  }

  const properties =
    parsed.properties && typeof parsed.properties === "object"
      ? (parsed.properties as Record<string, unknown>)
      : {};

  console.log("");
  console.log(`generateLink.recovery status=${response.status} ok=${response.ok}`);
  console.log(`  hashed_token=${properties.hashed_token ? "present" : "missing"}`);
  console.log(`  action_link=${properties.action_link ? "present" : "missing"}`);
  console.log(`  verification_type=${String(properties.verification_type ?? "")}`);
  if (!response.ok) {
    console.log(
      `  error=${String(parsed.msg ?? parsed.message ?? parsed.error_description ?? JSON.stringify(parsed).slice(0, 300))}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
