"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useState } from "react";
import type { StockupCardSummary } from "@/lib/commerce/stockup-billing";

let stripePromise: Promise<Stripe | null> | null = null;

function stripeClient(publishableKey: string) {
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

function CardConfirm({
  onSaved,
}: {
  onSaved: (card: StockupCardSummary) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function saveCard() {
    if (!stripe || !elements) return;
    setPending(true);
    setError("");
    const result = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });
    if (result.error || !result.setupIntent) {
      setError(result.error?.message ?? "The card was not saved");
      setPending(false);
      return;
    }
    const response = await fetch("/api/stockup/billing/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setupIntentId: result.setupIntent.id }),
    });
    const body = (await response.json()) as { error?: string; card?: StockupCardSummary };
    if (!response.ok || !body.card) {
      setError(body.error ?? "The card was not saved");
      setPending(false);
      return;
    }
    onSaved(body.card);
    setPending(false);
  }

  return (
    <div className="space-y-3">
      <PaymentElement />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="button"
        disabled={!stripe || pending}
        onClick={() => void saveCard()}
        className="inline-flex h-10 items-center rounded-full bg-[#064E3B] px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving card..." : "Save card"}
      </button>
    </div>
  );
}

export function SavedCardForm({
  card,
  onSaved,
}: {
  card: StockupCardSummary | null;
  onSaved: (card: StockupCardSummary) => void;
}) {
  const [setup, setSetup] = useState<{ clientSecret: string; publishableKey: string } | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function start() {
    setPending(true);
    setError("");
    const response = await fetch("/api/stockup/billing/setup", { method: "POST" });
    const body = (await response.json()) as {
      error?: string;
      clientSecret?: string;
      publishableKey?: string;
    };
    if (!response.ok || !body.clientSecret || !body.publishableKey) {
      setError(body.error ?? "Unable to start card setup");
      setPending(false);
      return;
    }
    setSetup({ clientSecret: body.clientSecret, publishableKey: body.publishableKey });
    setPending(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-bold text-[#064E3B]">Saved card</h2>
      {card?.last4 ? (
        <p className="mt-1 text-sm text-slate-600">
          {card.brand ?? "Card"} ···· {card.last4}
          {card.expMonth && card.expYear ? ` · ${card.expMonth}/${card.expYear}` : ""}
        </p>
      ) : (
        <p className="mt-1 text-sm text-slate-600">No card saved yet. Auto-Restock charges this card off session.</p>
      )}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      {setup ? (
        <div className="mt-3">
          <Elements stripe={stripeClient(setup.publishableKey)} options={{ clientSecret: setup.clientSecret }}>
            <CardConfirm
              onSaved={(saved) => {
                setSetup(null);
                onSaved(saved);
              }}
            />
          </Elements>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => void start()}
          className="mt-3 text-sm font-semibold text-[#064E3B] underline decoration-[#064E3B]/30 underline-offset-2"
        >
          {pending ? "Opening card form..." : card ? "Replace card" : "Add a card"}
        </button>
      )}
    </div>
  );
}
