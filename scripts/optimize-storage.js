/**
 * One-time Supabase Storage optimizer: resize JPEG/PNG to max 1920px and
 * re-encode as WebP at 85% quality, overwriting the same object path.
 *
 * Run from project root (requires .env.local with service role key):
 *   npm run optimize:storage
 *
 * Options:
 *   --dry-run   List candidates and estimated savings without uploading
 *   --bucket=X  Process only one bucket
 */

const { readFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");
const WebSocket = require("ws");

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = WebSocket;
}

const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 85;
const CONCURRENCY = 2;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const OPTIMIZABLE_EXT = new Set(["jpg", "jpeg", "png"]);
const SKIP_EXT = new Set(["webp", "svg", "gif", "pdf", "ico", "bmp", "avif"]);

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
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  let dryRun = false;
  let bucketFilter = null;

  for (const arg of args) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg.startsWith("--bucket=")) bucketFilter = arg.slice("--bucket=".length);
  }

  return { dryRun, bucketFilter };
}

function fileExtension(path) {
  const name = path.split("/").pop() || path;
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return "";
  return name.slice(dot + 1).toLowerCase();
}

function shouldOptimize(path) {
  const ext = fileExtension(path);
  if (!ext || SKIP_EXT.has(ext)) return false;
  return OPTIMIZABLE_EXT.has(ext);
}

async function listAllFiles(supabase, bucket, folder = "") {
  const paths = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit: 1000,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      throw new Error(`Failed to list ${bucket}/${folder || ""}: ${error.message}`);
    }

    if (!data?.length) break;

    for (const item of data) {
      const itemPath = folder ? `${folder}/${item.name}` : item.name;
      if (item.id === null) {
        paths.push(...(await listAllFiles(supabase, bucket, itemPath)));
      } else {
        paths.push(itemPath);
      }
    }

    if (data.length < 1000) break;
    offset += data.length;
  }

  return paths;
}

async function optimizeFile(supabase, bucket, path, dryRun) {
  const { data } = await withRetries(`download ${bucket}/${path}`, () =>
    supabase.storage.from(bucket).download(path)
  );

  const originalBuffer = Buffer.from(await data.arrayBuffer());
  const originalBytes = originalBuffer.length;

  if (isWebpBuffer(originalBuffer)) {
    console.log(`Skipped (already WebP): ${bucket}/${path}`);
    return {
      originalBytes,
      optimizedBytes: originalBytes,
      uploaded: false,
      alreadyWebp: true,
    };
  }

  const optimizedBuffer = await sharp(originalBuffer)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();

  const savedBytes = originalBytes - optimizedBuffer.length;
  const savedPct = ((savedBytes / originalBytes) * 100).toFixed(1);

  if (dryRun) {
    console.log(
      `[dry-run] ${bucket}/${path}: ${formatBytes(originalBytes)} -> ${formatBytes(optimizedBuffer.length)} (${savedPct}% saved)`
    );
    return { originalBytes, optimizedBytes: optimizedBuffer.length, uploaded: false };
  }

  await withRetries(`upload ${bucket}/${path}`, () =>
    supabase.storage.from(bucket).upload(path, optimizedBuffer, {
      upsert: true,
      contentType: "image/webp",
      cacheControl: "31536000",
    })
  );

  console.log(
    `Optimized ${bucket}/${path}: ${formatBytes(originalBytes)} -> ${formatBytes(optimizedBuffer.length)} (${savedPct}% saved)`
  );

  return { originalBytes, optimizedBytes: optimizedBuffer.length, uploaded: true };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function processInBatches(items, concurrency, handler) {
  for (let index = 0; index < items.length; index += concurrency) {
    const batch = items.slice(index, index + concurrency);
    await Promise.all(batch.map((item) => handler(item)));
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetries(label, fn) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const result = await fn();
      if (result?.error) {
        throw new Error(result.error.message);
      }
      return result;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        console.warn(`${label}: attempt ${attempt} failed (${err.message}), retrying...`);
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }
  throw lastError;
}

function isWebpBuffer(buffer) {
  return buffer.length >= 12 && buffer.toString("ascii", 8, 12) === "WEBP";
}

async function main() {
  loadEnvLocal();
  const { dryRun, bucketFilter } = parseArgs();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error("Failed to list buckets:", bucketsError.message);
    process.exit(1);
  }

  const targetBuckets = (buckets ?? [])
    .map((b) => b.name)
    .filter((name) => !bucketFilter || name === bucketFilter);

  if (bucketFilter && targetBuckets.length === 0) {
    console.error(`Bucket not found: ${bucketFilter}`);
    process.exit(1);
  }

  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Optimizing storage in ${targetBuckets.length} bucket(s)...`
  );

  const stats = {
    scanned: 0,
    optimized: 0,
    skipped: 0,
    alreadyWebp: 0,
    failed: 0,
    originalBytes: 0,
    optimizedBytes: 0,
  };

  for (const bucket of targetBuckets) {
    console.log(`\nBucket: ${bucket}`);
    let paths;
    try {
      paths = await listAllFiles(supabase, bucket);
    } catch (err) {
      console.error(`  Failed to list files: ${err.message}`);
      continue;
    }

    console.log(`  Found ${paths.length} object(s)`);

    const candidates = paths.filter((path) => shouldOptimize(path));
    stats.scanned += paths.length;
    stats.skipped += paths.length - candidates.length;

    await processInBatches(candidates, CONCURRENCY, async (path) => {
      try {
        const result = await optimizeFile(supabase, bucket, path, dryRun);
        stats.originalBytes += result.originalBytes;
        stats.optimizedBytes += result.optimizedBytes;
        if (result.alreadyWebp) {
          stats.alreadyWebp += 1;
        } else if (result.uploaded || dryRun) {
          stats.optimized += 1;
        }
      } catch (err) {
        stats.failed += 1;
        console.error(`  Failed ${bucket}/${path}: ${err.message}`);
      }
    });
  }

  const totalSaved = stats.originalBytes - stats.optimizedBytes;

  console.log("\n--- Summary ---");
  console.log(`Scanned:    ${stats.scanned}`);
  console.log(`Optimized:  ${stats.optimized}`);
  console.log(`Already WebP: ${stats.alreadyWebp}`);
  console.log(`Skipped:    ${stats.skipped}`);
  console.log(`Failed:     ${stats.failed}`);
  console.log(`Before:     ${formatBytes(stats.originalBytes)}`);
  console.log(`After:      ${formatBytes(stats.optimizedBytes)}`);
  console.log(`Saved:      ${formatBytes(totalSaved)}`);

  if (dryRun) {
    console.log("\nRe-run without --dry-run to apply changes.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
