"use client";

import { useState } from "react";

export function MembershipCheckoutButton({ cancelled = false }: { cancelled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/member/checkout", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Unable to start checkout.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Unable to start checkout.");
      setLoading(false);
    }
  }

  return (
    <>
      {cancelled ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment was cancelled. You can try again when you&apos;re ready.
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleCheckout()}
        disabled={loading}
        className="fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-sm px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
      >
        {loading ? "Redirecting to Stripe..." : "Make Payment Now"}
      </button>
    </>
  );
}
