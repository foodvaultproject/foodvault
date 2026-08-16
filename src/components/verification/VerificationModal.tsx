"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { MembershipPassViewer } from "@/lib/hospitality/pass-viewer";

type VerificationModalProps = {
  open: boolean;
  onClose: () => void;
  venueName: string;
  offerTitle: string;
  viewer: MembershipPassViewer | null;
};

function nzClockParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value.padStart(2, "0") ?? "00";

  return `${value("hour")}:${value("minute")}:${value("second")}`;
}

function nzLiveDate(date: Date) {
  return new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function VerificationModal({
  open,
  onClose,
  venueName,
  offerTitle,
  viewer,
}: VerificationModalProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!open) return;

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open || !viewer) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-pass-title"
        className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col"
      >
        <header className="border-b border-border px-6 py-5 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            In-person verification
          </p>
          <h2 id="membership-pass-title" className="mt-2 text-2xl font-bold text-foreground">
            {venueName}
          </h2>
          {offerTitle ? (
            <p className="mt-1 text-sm font-semibold text-primary">{offerTitle}</p>
          ) : null}
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          {viewer.avatarUrl ? (
            <Image
              src={viewer.avatarUrl}
              alt=""
              width={96}
              height={96}
              unoptimized
              className="h-24 w-24 rounded-full border-2 border-emerald-500 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-50 text-2xl font-bold text-emerald-800">
              {viewer.initials}
            </div>
          )}

          <p className="mt-4 text-xl font-bold text-foreground">{viewer.fullName}</p>
          <span className="mt-3 inline-flex items-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
            Active Member
          </span>

          <p className="mt-8 font-mono text-5xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-6xl">
            {nzClockParts(now)}
          </p>
          <p className="mt-3 text-sm font-semibold text-foreground">{nzLiveDate(now)}</p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Live New Zealand time. Staff should confirm this clock is still ticking —
            screenshots will not match the current second.
          </p>
        </div>

        <div className="px-6 pb-8 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
}
