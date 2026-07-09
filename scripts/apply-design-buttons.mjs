import fs from "fs";
import path from "path";

const replacements = [
  [
    "inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto",
    "fv-btn-primary inline-flex w-full items-center justify-center rounded-xl px-8 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto",
  ],
  [
    "inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto",
    "fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto",
  ],
  [
    "inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:px-4 sm:text-sm md:px-5",
    "fv-btn-primary inline-flex shrink-0 items-center justify-center rounded-full px-3 py-2 text-xs font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:px-4 sm:text-sm md:px-5",
  ],
  [
    "block rounded-xl bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary block rounded-xl px-4 py-3 text-center text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "rounded bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  ["rgba(0,82,255,0.06)", "rgba(79,70,229,0.06)"],
  ["rgba(0,82,255,0.08)", "rgba(79,70,229,0.08)"],
  ["rgba(0,82,255,0.28)", "rgba(79,70,229,0.28)"],
  ["shadow-[0_4px_14px_rgba(0,82,255,0.28)]", "shadow-button"],
  [
    "rounded bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60",
  ],
  [
    "rounded bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60",
  ],
  [
    "rounded bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60",
  ],
  [
    "mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60",
    "fv-btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60",
  ],
  [
    "inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto",
    "fv-btn-primary inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto",
  ],
  [
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "mt-8 inline-flex rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary mt-8 inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover",
    "fv-btn-primary mt-4 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover",
    "fv-btn-primary mt-5 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60",
    "fv-btn-primary inline-flex w-full items-center justify-center rounded-xl px-6 py-4 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60",
  ],
  [
    "inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto",
  ],
  [
    "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60",
    "fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60",
  ],
  [
    "inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto",
    "fv-btn-primary inline-flex w-full shrink-0 items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto",
  ],
  [
    "w-full shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto",
    "fv-btn-primary inline-flex w-full shrink-0 items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto",
  ],
  [
    "w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60",
    "fv-btn-primary inline-flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60",
  ],
  [
    "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:shrink-0",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:shrink-0",
  ],
  [
    "flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex shrink-0 items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60",
    "fv-btn-primary inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60",
  ],
  [
    "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-hover",
    "fv-btn-primary mt-6 inline-flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover sm:w-auto",
    "fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto",
  ],
  [
    "flex items-center gap-1.5 bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-hover",
    "fv-btn-primary mt-3 inline-flex h-10 items-center justify-center rounded-xl px-3 text-xs font-bold text-primary-foreground transition-[transform,box-shadow] duration-150",
  ],
  [
    "rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60",
    "fv-btn-primary inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60",
  ],
];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name !== "node_modules" && ent.name !== ".next") walk(p);
    } else if (/\.(tsx|ts)$/.test(ent.name)) {
      let content = fs.readFileSync(p, "utf8");
      let next = content;
      for (const [from, to] of replacements) {
        next = next.split(from).join(to);
      }
      if (next !== content) {
        fs.writeFileSync(p, next);
        console.log(p);
      }
    }
  }
}

walk("src");
