/**
 * Diagnose which Supabase Auth step returns "email rate limit exceeded".
 *
 * Run from project root:
 *   npm run diagnose:signup-auth -- you@example.com
 *
 * Uses .env.local. Does not send Resend emails — only tests Supabase admin APIs.
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

type AuthResponse = {
  ok: boolean;
  status: number;
  body: Record<string, unknown>;
};

async function callAuth(
  baseUrl: string,
  serviceRoleKey: string,
  path: string,
  body: Record<string, unknown>
): Promise<AuthResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    parsed = { raw: text };
  }

  return { ok: response.ok, status: response.status, body: parsed };
}

function report(step: string, result: AuthResponse) {
  if (result.ok) {
    console.log(`✅ ${step}: ok (${result.status})`);
    return true;
  }

  const message =
    typeof result.body.msg === "string"
      ? result.body.msg
      : typeof result.body.error_description === "string"
        ? result.body.error_description
        : typeof result.body.message === "string"
          ? result.body.message
          : JSON.stringify(result.body);

  console.log(`❌ ${step}: ${message}`);
  console.log(`   status: ${result.status}`);
  if (typeof result.body.error_code === "string") {
    console.log(`   code: ${result.body.error_code}`);
  }
  return false;
}

async function main() {
  loadEnvLocal();

  const email = process.argv[2]?.trim();
  if (!email) {
    console.error("Usage: npm run diagnose:signup-auth -- you@example.com");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const password = `Diag-${Date.now().toString(36)}!Aa1`;
  const redirectTo = `${(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")}/auth/confirm`;

  console.log("FoodVault signup auth diagnostic");
  console.log(`Supabase URL: ${url}`);
  console.log(`Test email: ${email}`);
  console.log("");

  console.log("1) POST /auth/v1/admin/generate_link type=signup (new FoodVault path)");
  const signupLink = await callAuth(url, serviceRoleKey, "/auth/v1/admin/generate_link", {
    type: "signup",
    email,
    password,
    data: { account_type: "member", diagnostic: true },
    redirect_to: redirectTo,
  });
  report("admin.generateLink.signup", signupLink);

  console.log("");
  console.log("2) POST /auth/v1/admin/generate_link type=invite (resend path)");
  const inviteLink = await callAuth(url, serviceRoleKey, "/auth/v1/admin/generate_link", {
    type: "invite",
    email,
    redirect_to: redirectTo,
  });
  report("admin.generateLink.invite", inviteLink);

  if (anonKey) {
    console.log("");
    console.log("3) POST /auth/v1/signup (legacy path — triggers Supabase mailer)");
    const clientSignup = await fetch(`${url}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `diag-client-${Date.now()}@example.com`,
        password,
      }),
    });
    const signupBody = await clientSignup.json();
    report("client.signUp", {
      ok: clientSignup.ok,
      status: clientSignup.status,
      body: signupBody as Record<string, unknown>,
    });
  }

  console.log("");
  console.log("Interpretation:");
  console.log("- If step 1/2 fail with rate limit → Supabase project email quota is exhausted.");
  console.log("- If only step 3 fails → admin path is fine; production may still call signUp().");
  console.log("- Check Supabase Dashboard → Authentication → Logs for endpoint paths.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
