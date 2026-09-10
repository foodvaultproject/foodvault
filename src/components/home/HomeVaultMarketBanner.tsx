"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { requestVaultMarketLaunchAlert } from "@/lib/commerce/launch-alert-actions";

const PILLARS = [
  {
    title: "One Combined Box",
    body: "All your pantry staples picked, packed, and delivered in a single shipment.",
  },
  {
    title: "Direct Warehouse Fulfilment",
    body: "Shipped directly from FoodVault's central Auckland facility.",
  },
  {
    title: "Exclusive Member Access",
    body: "Reserved exclusively for active FoodVault members.",
  },
] as const;

function NotifyLaunchModal({
  open,
  onClose,
  initialEmail,
}: {
  open: boolean;
  onClose: () => void;
  initialEmail: string;
}) {
  const titleId = useId();
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEmail(initialEmail);
    setError(null);
    setSuccess(null);
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
  }, [open, onClose, initialEmail]);

  if (typeof document === "undefined" || !open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const result = await requestVaultMarketLaunchAlert(email);
    setSaving(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    const isAlreadySubscribed = "alreadySubscribed" in result && Boolean(result.alreadySubscribed);
    setSuccess(
      isAlreadySubscribed
        ? "You're already on the Vault Market launch list."
        : "We'll email you when Vault Market launches."
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close launch notification"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-2xl"
      >
        <div className="bg-[#064E3B] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/80">
                Vault Market
              </p>
              <h2 id={titleId} className="mt-1 text-xl font-bold leading-snug">
                Notify me at launch
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
          {success ? (
            <p className="text-sm text-foreground">{success}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-sm text-muted">
                Leave your email and we will let you know when Vault Market opens to members.
              </p>
              <label htmlFor="vault-market-launch-email" className="sr-only">
                Email address
              </label>
              <input
                id="vault-market-launch-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-vm-primary focus:outline-none focus:ring-2 focus:ring-vm-primary/20"
              />
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-[#10B981] px-4 text-sm font-semibold text-white hover:bg-[#064E3B] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Notify Me at Launch"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function HomeVaultMarketBanner({
  compactSpacing = false,
}: {
  compactSpacing?: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionEmail, setSessionEmail] = useState("");

  useEffect(() => {
    let cancelled = false;
    void getAuthSession().then((session) => {
      if (!cancelled && session?.email) setSessionEmail(session.email);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={compactSpacing ? "py-8 sm:py-10" : "py-10 sm:py-14"}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#10B981]/30 bg-[#064E3B] px-6 py-8 text-white shadow-sm sm:px-10 sm:py-10">
          <span className="inline-flex items-center rounded-full border border-[#A3E635]/30 bg-[#A3E635]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#A3E635]">
            Vault Market — COMING SOON
          </span>
          <h2 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">
            Vault Market: FoodVault’s Own Direct Fulfilment
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base">
            Distinct from our direct partner brand deals, Vault Market is FoodVault&apos;s upcoming
            in-house warehouse store. Get shelf-stable staples and household essentials packed into
            one single delivery.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-xl border border-[#10B981]/30 bg-white/10 px-4 py-4 backdrop-blur-sm"
              >
                <p className="text-sm font-bold">{pillar.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-11 items-center justify-center rounded-sm bg-[#10B981] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#064E3B]"
            >
              Notify Me at Launch
            </button>
            <Link
              href="/pantry"
              className="inline-flex h-11 items-center justify-center rounded-sm border border-[#10B981]/30 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Preview Upcoming Market
            </Link>
          </div>
        </div>
      </div>
      <NotifyLaunchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialEmail={sessionEmail}
      />
    </section>
  );
}
