/**
 * Migrates FoodVault to the restrained radius scale:
 * xs 6px | sm 8px (buttons) | md 10px (inputs) | lg 12px (cards) | xl 16px (panels)
 */
import fs from "fs";
import path from "path";

const ROOT = "src";

const BUTTON_MARKERS =
  /(?:fv-btn|portalBtn|adminPrimaryButton|adminSecondaryButton|btnPrimary|btnSecondary|btnGhost|<button|<\/button>|type="submit"|type="button")/i;

const INPUT_MARKERS =
  /(?:inputBase|adminInputClass|portalInput|portalSelect|portalTextarea|<input|<select|<textarea|type="(?:text|email|password|search|tel|url|number)"|placeholder:|file:)/i;

const PILL_MARKERS =
  /(?:rounded-full|fv-badge|status|chip|tag|badge|filter|pill|CategoryChip|BrandDepartment|ArticleTags|CommissionStatus|OfferBadge|BrandTileDiscount)/i;

function isPillContext(line) {
  return PILL_MARKERS.test(line);
}

function lineLooksLikeButton(line) {
  if (isPillContext(line)) return false;
  return (
    BUTTON_MARKERS.test(line) ||
    /\bfv-btn-primary\b/.test(line) ||
    /\bfv-btn-secondary\b/.test(line) ||
    /\bfv-btn-ghost\b/.test(line) ||
    (/\b(?:inline-flex|flex)\b/.test(line) &&
      /\b(?:px-|py-|h-11|h-10|items-center justify-center)\b/.test(line) &&
      /\b(?:bg-primary|border border-border.*font-semibold|font-medium)\b/.test(line) &&
      !INPUT_MARKERS.test(line))
  );
}

function lineLooksLikeInput(line) {
  if (isPillContext(line)) return false;
  return (
    INPUT_MARKERS.test(line) ||
    (/\bw-full\b/.test(line) &&
      /\b(?:border border-border|border-border bg-background)\b/.test(line) &&
      /\b(?:px-|py-|h-11|placeholder:)\b/.test(line) &&
      !lineLooksLikeButton(line))
  );
}

function migrateLine(line) {
  if (isPillContext(line)) {
    return line;
  }

  let next = line;

  // Cards & large containers (20px -> 12px)
  next = next.replace(/\brounded-2xl\b/g, "rounded-lg");

  // Partner portal tokens that used rounded-lg for controls
  if (/\bportalBtn(?:Outline|Primary|Ghost)\b/.test(next)) {
    next = next.replace(/\brounded-lg\b/g, "rounded-sm");
  }
  if (/\bportal(?:Input|Select|Textarea)\b/.test(next)) {
    next = next.replace(/\brounded-lg\b/g, "rounded-md");
  }

  if (/\brounded-xl\b/.test(next)) {
    if (lineLooksLikeButton(next)) {
      next = next.replace(/\brounded-xl\b/g, "rounded-sm");
    } else if (lineLooksLikeInput(next)) {
      next = next.replace(/\brounded-xl\b/g, "rounded-md");
    } else {
      next = next.replace(/\brounded-xl\b/g, "rounded-lg");
    }
  }

  // Secondary/outline buttons still on rounded-lg
  if (lineLooksLikeButton(next) && !isPillContext(next)) {
    next = next.replace(/\brounded-lg\b/g, "rounded-sm");
  }

  // Inputs on rounded-lg
  if (lineLooksLikeInput(next) && !isPillContext(next)) {
    next = next.replace(/\brounded-lg\b/g, "rounded-md");
  }

  // Bare `rounded` on buttons/inputs
  if (lineLooksLikeButton(next)) {
    next = next.replace(/\brounded\b(?!-)/g, "rounded-sm");
  } else if (lineLooksLikeInput(next)) {
    next = next.replace(/\brounded\b(?!-)/g, "rounded-md");
  }

  return next;
}

function migrateContent(content, filePath) {
  if (filePath.endsWith("globals.css")) {
    return content;
  }

  return content
    .split("\n")
    .map((line) => migrateLine(line))
    .join("\n");
}

function walk(dir, changed = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name !== "node_modules" && ent.name !== ".next") {
        walk(p, changed);
      }
    } else if (/\.(tsx|ts|css|mjs)$/.test(ent.name)) {
      if (p.includes("migrate-radius-scale.mjs")) continue;
      const content = fs.readFileSync(p, "utf8");
      const next = migrateContent(content, p);
      if (next !== content) {
        fs.writeFileSync(p, next);
        changed.push(p);
      }
    }
  }
  return changed;
}

const changed = walk(ROOT);
console.log(`Updated ${changed.length} files:`);
for (const f of changed) console.log(f);
