/**
 * Temporary local trigger for /api/cron/generate-blog.
 *
 * Run from project root (requires the Next.js app on port 3001):
 *   npx tsx scripts/test-cron.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    throw new Error("No .env.local found in the project root.");
  }

  const loadedKeys: string[] = [];
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
    loadedKeys.push(key);
  }
  return loadedKeys;
}

async function main() {
  const loadedKeys = loadEnvLocal();

  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    throw new Error(
      `CRON_SECRET is missing from .env.local. Keys loaded: ${loadedKeys.join(", ") || "(none)"}`
    );
  }

  const url = "http://localhost:3001/api/cron/generate-blog";
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
    // Keep the raw text if the endpoint did not return JSON.
  }

  console.log(
    JSON.stringify(
      {
        status: response.status,
        ok: response.ok,
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
