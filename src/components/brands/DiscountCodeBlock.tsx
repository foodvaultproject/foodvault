"use client";

import Link from "next/link";
import { useState } from "react";
import type { CodeAccessState } from "@/lib/member/partner-profile";

type DiscountCodeBlockProps = {
  code: string | null;
  state: CodeAccessState;
  compact?: boolean;
  variant?: "default" | "card";
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
  variant = "default",
}: DiscountCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const isCard = variant === "card";

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
      <div className={compact || isCard ? "" : "mt-2"}>
        <div
          className={`flex overflow-hidden rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 ${
            isCard ? "flex-col sm:flex-row sm:items-stretch" : "items-stretch"
          }`}
        >
          <div
            className={`flex flex-1 items-center ${
              isCard ? "justify-center px-2 py-2 sm:justify-start sm:px-3" : "px-4 py-3"
            }`}
          >
            <span
              className={`break-all text-center font-mono font-bold tracking-wide text-foreground sm:text-left ${
                isCard ? "text-xs sm:text-sm" : "text-base"
              }`}
            >
              {code}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`fv-btn-primary inline-flex items-center justify-center gap-1.5 rounded-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 ${
              isCard
                ? "border-t border-primary/20 px-3 py-2 text-[11px] sm:border-l sm:border-t-0 sm:px-3 sm:py-2"
                : "px-4 py-2 text-sm"
            }`}
          >
            {copied ? "Copied!" : isCard ? "Copy" : "Copy Code"}
          </button>
        </div>
        {!compact && !isCard ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Enter this code during checkout on the partner&apos;s website.
          </p>
        ) : null}
      </div>
    );
  }

  const message = LOCKED_MESSAGE[state as Exclude<CodeAccessState, "visible">];

  return (
    <div className={compact || isCard ? "" : "mt-2"}>
      <div
        className={`flex overflow-hidden rounded-lg border-2 border-dashed border-border bg-surface ${
          isCard ? "flex-col sm:flex-row sm:items-stretch" : "items-stretch"
        }`}
      >
        <div
          className={`flex flex-1 items-center ${
            isCard ? "justify-center px-2 py-2 sm:justify-start sm:px-3" : "px-4 py-3"
          }`}
        >
          <span
            className={`select-none break-all text-center font-mono font-bold tracking-wide text-muted-foreground blur-sm sm:text-left ${
              isCard ? "text-xs sm:text-sm" : "text-base"
            }`}
          >
            FOODVAULT-XXXXX
          </span>
        </div>
        <button
          type="button"
          disabled
          className={`flex cursor-not-allowed items-center justify-center gap-1.5 border-border bg-surface font-semibold text-muted-foreground ${
            isCard
              ? "border-t px-3 py-2 text-[11px] sm:border-l sm:border-t-0"
              : "border-l px-4 text-sm"
          }`}
        >
          {isCard ? "Copy" : "Copy Code"}
        </button>
      </div>
      <p className={`text-muted-foreground ${isCard ? "mt-1.5 text-[10px] leading-snug" : "mt-2 text-xs"}`}>
        {message}
      </p>
      {state === "anon" ? (
        <Link
          href="/signup"
          className={`inline-flex font-semibold text-primary hover:underline ${
            isCard ? "mt-1 text-[10px]" : "mt-2 text-xs"
          }`}
        >
          Become a member to unlock &rarr;
        </Link>
      ) : null}
    </div>
  );
}
