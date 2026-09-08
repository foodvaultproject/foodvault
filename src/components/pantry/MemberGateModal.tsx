"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { LOGIN_PATH, SIGNUP_PATH } from "@/lib/auth";
import { SIGNUP_MEMBERSHIP_PATH } from "@/lib/member/paths";
import { formatNzPrice } from "@/lib/partner-offer";

export type MemberGateModalProps = {
  open: boolean;
  onClose: () => void;
  savings: number;
  productName?: string;
  isLoggedIn: boolean;
};

export function MemberGateModal({
  open,
  onClose,
  savings,
  productName,
  isLoggedIn,
}: MemberGateModalProps) {
  const titleId = useId();
  const signupHref = isLoggedIn
    ? SIGNUP_MEMBERSHIP_PATH
    : `${SIGNUP_PATH}?next=${encodeURIComponent("/pantry")}`;
  const loginHref = `${LOGIN_PATH}?next=${encodeURIComponent("/pantry")}`;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (typeof document === "undefined" || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close membership offer"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-2xl"
      >
        <div className="bg-primary px-5 py-4 text-primary-foreground">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-primary-foreground/80">
                Vault Market
              </p>
              <h2 id={titleId} className="mt-1 text-xl font-bold leading-snug">
                Unlock Member-Only Pantry Pricing
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {productName
              ? `Members save on ${productName} and every other Vault Market staple.`
              : "Members unlock exclusive pantry pricing on every Vault Market order."}
          </p>
          <div className="mt-4 rounded-xl border border-success/20 bg-success-light px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-success">
              Estimated member savings
            </p>
            <p className="mt-1 text-3xl font-bold text-success">{formatNzPrice(savings)}</p>
            <p className="mt-1 text-xs text-success/80">
              The difference between retail and member price
              {productName ? " on this item" : " on these items"}.
            </p>
          </div>

          <div className="mt-5 space-y-2">
            <Link
              href={signupHref}
              className="fv-btn-primary inline-flex h-12 w-full items-center justify-center rounded-sm px-4 text-sm font-semibold text-primary-foreground"
            >
              Sign Up / Reactivate Membership
            </Link>
            <Link
              href={loginHref}
              className="inline-flex h-12 w-full items-center justify-center rounded-sm border border-border px-4 text-sm font-semibold text-foreground hover:bg-surface"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
