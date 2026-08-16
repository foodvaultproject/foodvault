"use client";

import { useEffect, useState } from "react";
import type { MembershipPassViewer } from "@/lib/hospitality/pass-viewer";

type MembershipVerificationModalProps = {
  open: boolean;
  onClose: () => void;
  venueName: string;
  offerTitle: string;
  viewer: MembershipPassViewer | null;
};

function formatNzClock(date: Date) {
  return new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function MembershipVerificationModal({
  open,
  onClose,
  venueName,
  offerTitle,
  viewer,
}: MembershipVerificationModalProps) {
  const [clock, setClock] = useState(() => formatNzClock(new Date()));

  useEffect(() => {
    if (!open) return;

    const timer = window.setInterval(() => {
      setClock(formatNzClock(new Date()));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !viewer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-pass-title"
        className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-background shadow-xl"
      >
        <div className="border-b border-border px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            In-person membership
          </p>
          <h2 id="membership-pass-title" className="mt-1 text-lg font-bold text-foreground">
            {venueName}
          </h2>
          <p className="mt-1 text-sm font-semibold text-primary">{offerTitle}</p>
        </div>

        <div className="px-5 py-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-primary/10 text-lg font-bold text-primary">
            {viewer.initials}
          </div>
          <p className="mt-3 text-base font-bold text-foreground">{viewer.fullName}</p>
          <span className="mt-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
            Active Member
          </span>
          <p className="mt-5 font-mono text-3xl font-extrabold tabular-nums tracking-tight text-foreground">
            {clock}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Live New Zealand time. Staff should check this clock is still ticking.
          </p>
        </div>

        <div className="border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Close / Done
          </button>
        </div>
      </div>
    </div>
  );
}
