/**
 * Temporary production trigger for /api/cron/generate-blog.
 * Reads CRON_SECRET from .env.local and does not print it.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    throw new Error("No .env.local found in the project root.");
  }

  const raw = readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim().replace(/^export\s+/, "");
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    throw new Error("CRON_SECRET is missing from .env.local.");
  }

  const url = "https://www.foodvault.co.nz/api/cron/generate-blog";
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });

  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Keep raw text when the endpoint does not return JSON.
  }

  const success =
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    (body as { success?: unknown }).success === true;

  console.log(
    JSON.stringify(
      {
        status: response.status,
        ok: response.ok,
        success,
        body,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
