"use client";

import Link from "next/link";
import { useState } from "react";
import type { CodeAccessState } from "@/lib/member/partner-profile";

type DiscountCodeBlockProps = {
  code: string | null;
  state: CodeAccessState;
  compact?: boolean;
};

const LOCKED_MESSAGE: Record<Exclude<CodeAccessState, "visible">, string> = {
  anon: "Sign in or become a member to unlock this exclusive member discount code.",
  "partner-other":
    "Member discount codes for other participating brands are only available to Members and Free Trial Members.",
  "member-required":
    "Your membership is not active. Reactivate your membership to view member discount codes.",
};

export function DiscountCodeBlock({
  code,
  state,
  compact = false,
}: DiscountCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (state === "visible" && code) {
    return (
      <div className={compact ? "" : "mt-2"}>
        <div className="flex items-stretch overflow-hidden rounded-lg border-2 border-dashed border-primary/40 bg-primary/5">
          <div className="flex flex-1 items-center px-4 py-3">
            <span className="font-mono text-base font-bold tracking-wide text-foreground">
              {code}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="fv-btn-primary inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
        {!compact ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Enter this code during checkout on the partner&apos;s website.
          </p>
        ) : null}
      </div>
    );
  }

  const message = LOCKED_MESSAGE[state as Exclude<CodeAccessState, "visible">];

  return (
    <div className={compact ? "" : "mt-2"}>
      <div className="flex items-stretch overflow-hidden rounded-lg border-2 border-dashed border-border bg-surface">
        <div className="flex flex-1 items-center px-4 py-3">
          <span className="select-none font-mono text-base font-bold tracking-wide text-muted-foreground blur-sm">
            FOODVAULT-XXXXX
          </span>
        </div>
        <button
          type="button"
          disabled
          className="flex cursor-not-allowed items-center gap-1.5 border-l border-border bg-surface px-4 text-sm font-semibold text-muted-foreground"
        >
          Copy Code
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{message}</p>
      {state === "anon" ? (
        <Link
          href="/signup"
          className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline"
        >
          Become a member to unlock &rarr;
        </Link>
      ) : null}
    </div>
  );
}
