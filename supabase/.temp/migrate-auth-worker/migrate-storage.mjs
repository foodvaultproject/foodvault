import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEMP_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIRROR_DIR = join(TEMP_DIR, "storage_mirror");
const SOURCE_REF = "aqofnwfgrhwiupdxwbpx";
const TARGET_REF = "ujsuhujujdowqpmertmt";
const SOURCE_HOST = `${SOURCE_REF}.supabase.co`;
const TARGET_HOST = `${TARGET_REF}.supabase.co`;
const PUBLIC_BUCKETS = ["partner-assets", "article-images"];

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

function getProjectKeys(projectRef) {
  const output = run(`npx supabase projects api-keys --project-ref ${projectRef} -o json`);
  const keys = JSON.parse(output.match(/\[[\s\S]*\]/)?.[0] ?? output);
  const serviceRole = keys.find((key) => key.id === "service_role");
  if (!serviceRole) throw new Error(`Missing service_role key for ${projectRef}`);
  return {
    url: `https://${projectRef}.supabase.co`,
    serviceRoleKey: serviceRole.api_key,
  };
}

function listBucket(bucket) {
  const output = run(`npx supabase --experimental storage ls -r --linked ss:///${bucket}`);
  const match = output.match(/\{[\s\S]*"paths"\s*:\s*\[[\s\S]*\]\s*,[\s\S]*\}/);
  if (!match) throw new Error(`Failed to parse storage list for ${bucket}`);
  const parsed = JSON.parse(match[0]);
  return (parsed.paths ?? [])
    .filter((path) => path && !path.endsWith("/"))
    .map((path) => path.replace(new RegExp(`^/?${bucket}/`), ""));
}

function publicUrl(bucket, objectPath) {
  return `https://${SOURCE_HOST}/storage/v1/object/public/${bucket}/${objectPath}`;
}

function guessContentType(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".jfif")) return "image/jpeg";
  return "application/octet-stream";
}

async function downloadBucket(bucket, paths) {
  mkdirSync(join(MIRROR_DIR, bucket), { recursive: true });
  let downloaded = 0;
  for (const objectPath of paths) {
    const localPath = join(MIRROR_DIR, bucket, objectPath);
    if (existsSync(localPath)) {
      downloaded += 1;
      continue;
    }
    mkdirSync(dirname(localPath), { recursive: true });
    const response = await fetch(publicUrl(bucket, objectPath));
    if (!response.ok) {
      throw new Error(`Failed to download ${publicUrl(bucket, objectPath)}: ${response.status}`);
    }
    writeFileSync(localPath, Buffer.from(await response.arrayBuffer()));
    downloaded += 1;
    if (downloaded % 25 === 0) {
      console.log(`  ${bucket}: downloaded ${downloaded}/${paths.length}`);
    }
  }
  return downloaded;
}

async function walkFiles(dir, relative = "") {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const fullPath = join(dir, name);
    const nextRelative = relative ? `${relative}/${name}` : name;
    if (statSync(fullPath).isDirectory()) {
      entries.push(...(await walkFiles(fullPath, nextRelative)));
    } else {
      entries.push({ objectPath: nextRelative, fullPath });
    }
  }
  return entries;
}

async function uploadObject({ url, serviceRoleKey, bucket, objectPath, body, contentType }) {
  const encodedPath = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body,
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`${bucket}/${objectPath}: ${response.status} ${details}`);
  }
}

async function uploadBucket(targetKeys, bucket) {
  const baseDir = join(MIRROR_DIR, bucket);
  if (!existsSync(baseDir)) return 0;
  const files = await walkFiles(baseDir);
  let uploaded = 0;
  for (const file of files) {
    const body = readFileSync(file.fullPath);
    await uploadObject({
      url: targetKeys.url,
      serviceRoleKey: targetKeys.serviceRoleKey,
      bucket,
      objectPath: file.objectPath,
      body,
      contentType: guessContentType(file.fullPath),
    });
    uploaded += 1;
    if (uploaded % 25 === 0) {
      console.log(`  ${bucket}: uploaded ${uploaded}/${files.length}`);
    }
  }
  return uploaded;
}

function updateDatabaseUrls() {
  const sql = [
    "SET session_replication_role = replica;",
    `UPDATE public.partners SET`,
    `  banner_image_url = replace(banner_image_url, '${SOURCE_HOST}', '${TARGET_HOST}'),`,
    `  logo_url = replace(logo_url, '${SOURCE_HOST}', '${TARGET_HOST}'),`,
    `  banner_original_url = replace(banner_original_url, '${SOURCE_HOST}', '${TARGET_HOST}'),`,
    `  logo_original_url = replace(logo_original_url, '${SOURCE_HOST}', '${TARGET_HOST}'),`,
    `  gallery_image_urls = ARRAY(`,
    `    SELECT replace(value, '${SOURCE_HOST}', '${TARGET_HOST}')`,
    `    FROM unnest(gallery_image_urls) AS value`,
    `  ),`,
    `  gallery_original_urls = ARRAY(`,
    `    SELECT replace(value, '${SOURCE_HOST}', '${TARGET_HOST}')`,
    `    FROM unnest(gallery_original_urls) AS value`,
    `  )`,
    `WHERE banner_image_url LIKE '%${SOURCE_HOST}%'`,
    `   OR logo_url LIKE '%${SOURCE_HOST}%'`,
    `   OR banner_original_url LIKE '%${SOURCE_HOST}%'`,
    `   OR logo_original_url LIKE '%${SOURCE_HOST}%'`,
    `   OR EXISTS (`,
    `     SELECT 1 FROM unnest(gallery_image_urls) AS value WHERE value LIKE '%${SOURCE_HOST}%'`,
    `   )`,
    `   OR EXISTS (`,
    `     SELECT 1 FROM unnest(gallery_original_urls) AS value WHERE value LIKE '%${SOURCE_HOST}%'`,
    `   );`,
    `UPDATE public.discover_articles`,
    `SET hero_image_url = replace(hero_image_url, '${SOURCE_HOST}', '${TARGET_HOST}')`,
    `WHERE hero_image_url LIKE '%${SOURCE_HOST}%';`,
    "RESET ALL;",
  ].join("\n");

  const sqlPath = join(TEMP_DIR, "storage_url_update.sql");
  writeFileSync(sqlPath, `${sql}\n`, "utf8");
  run(`npx supabase db query --linked --file "${sqlPath.replace(/\\/g, "/")}"`);
}

function countRemainingOldUrls() {
  const [{ count }] = supabaseQuery(
    `SELECT COUNT(*)::int AS count FROM public.partners WHERE coalesce(banner_image_url,'') LIKE '%${SOURCE_HOST}%' OR coalesce(logo_url,'') LIKE '%${SOURCE_HOST}%' OR EXISTS (SELECT 1 FROM unnest(coalesce(gallery_image_urls, ARRAY[]::text[])) AS value WHERE value LIKE '%${SOURCE_HOST}%')`
  );
  const [{ article_count }] = supabaseQuery(
    `SELECT COUNT(*)::int AS article_count FROM public.discover_articles WHERE coalesce(hero_image_url,'') LIKE '%${SOURCE_HOST}%'`
  );
  return { partners: count, articles: article_count };
}

async function main() {
  const uploadOnly = process.argv.includes("--upload-only");
  mkdirSync(MIRROR_DIR, { recursive: true });
  const report = { source: {}, target: {}, buckets: PUBLIC_BUCKETS };

  if (!uploadOnly) {
    console.log(`Listing storage on ${SOURCE_REF}...`);
    linkProject(SOURCE_REF);
    for (const bucket of PUBLIC_BUCKETS) {
      const paths = listBucket(bucket);
      report.source[bucket] = paths.length;
      console.log(`Source ${bucket}: ${paths.length} files`);
      if (paths.length > 0) {
        console.log(`Downloading ${bucket}...`);
        await downloadBucket(bucket, paths);
      }
    }
  } else {
    for (const bucket of PUBLIC_BUCKETS) {
      const baseDir = join(MIRROR_DIR, bucket);
      if (!existsSync(baseDir)) {
        report.source[bucket] = 0;
        continue;
      }
      const files = await walkFiles(baseDir);
      report.source[bucket] = files.length;
      console.log(`Mirror ${bucket}: ${files.length} files`);
    }
  }

  console.log(`Uploading files to ${TARGET_REF}...`);
  const targetKeys = getProjectKeys(TARGET_REF);

  linkProject(TARGET_REF);
  for (const bucket of PUBLIC_BUCKETS) {
    if ((report.source[bucket] ?? 0) === 0) {
      report.target[bucket] = 0;
      continue;
    }
    console.log(`Uploading ${bucket}...`);
    await uploadBucket(targetKeys, bucket);
    report.target[bucket] = listBucket(bucket).length;
    console.log(`Target ${bucket}: ${report.target[bucket]} files`);
  }

  console.log("Updating database URLs to Sydney host...");
  updateDatabaseUrls();
  report.remainingOldUrls = countRemainingOldUrls();
  writeFileSync(join(TEMP_DIR, "storage_migration_report.json"), JSON.stringify(report, null, 2), "utf8");

  const mismatches = PUBLIC_BUCKETS.filter(
    (bucket) => (report.source[bucket] ?? 0) > 0 && report.source[bucket] !== report.target[bucket]
  );

  if (mismatches.length > 0) {
    console.log("FILE COUNT DISCREPANCIES:");
    for (const bucket of mismatches) {
      console.log(`  ${bucket}: source=${report.source[bucket]}, target=${report.target[bucket]}`);
    }
    process.exitCode = 1;
  } else {
    console.log("Storage file counts match for all buckets.");
  }

  if (report.remainingOldUrls.partners > 0 || report.remainingOldUrls.articles > 0) {
    console.log(
      `WARNING: Remaining old URLs - partners=${report.remainingOldUrls.partners}, articles=${report.remainingOldUrls.articles}`
    );
    process.exitCode = 1;
  } else {
    console.log("Database URLs now point to Sydney storage.");
  }

  linkProject(TARGET_REF);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
