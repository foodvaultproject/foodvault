"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useRef, useState } from "react";
import { beginStockupCardSetup, confirmStockupCard } from "@/lib/commerce/stockup-card-actions";
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
    if (!stripe || !elements) {
      setError("The card form is still loading. Wait a moment and try again.");
      return;
    }
    setPending(true);
    setError("");
    const submitted = await elements.submit();
    if (submitted.error) {
      setError(submitted.error.message ?? "Check the card details and try again");
      setPending(false);
      return;
    }
    const result = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: window.location.href },
    });
    if (result.error || !result.setupIntent) {
      setError(result.error?.message ?? "The card was not saved");
      setPending(false);
      return;
    }
    const saved = await confirmStockupCard(result.setupIntent.id);
    if (saved.error || !saved.card) {
      setError(saved.error ?? "The card was not saved");
      setPending(false);
      return;
    }
    onSaved(saved.card);
    setPending(false);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-800">Enter your card</p>
      <div className="min-h-24 rounded-md border border-slate-200 bg-white p-3">
        <PaymentElement />
      </div>
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
  const panelRef = useRef<HTMLDivElement>(null);
  const [setup, setSetup] = useState<{ clientSecret: string; publishableKey: string } | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  async function start() {
    setPending(true);
    setError("");
    setSavedMessage("");
    try {
      const result = await beginStockupCardSetup();
      if (result.error || !result.clientSecret || !result.publishableKey) {
        setError(result.error ?? "Unable to start card setup");
        setPending(false);
        return;
      }
      setSetup({ clientSecret: result.clientSecret, publishableKey: result.publishableKey });
      setPending(false);
      window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start card setup");
      setPending(false);
    }
  }

  return (
    <div ref={panelRef} className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-bold text-[#064E3B]">Saved card</h2>
      {card?.last4 ? (
        <p className="mt-1 text-sm text-slate-600">
          {card.brand ?? "Card"} ···· {card.last4}
          {card.expMonth && card.expYear ? ` · ${card.expMonth}/${card.expYear}` : ""}
        </p>
      ) : (
        <p className="mt-1 text-sm text-slate-600">No card saved yet. Auto-Restock charges this card off session.</p>
      )}
      {savedMessage ? <p className="mt-2 text-sm font-semibold text-[#064E3B]">{savedMessage}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      {setup ? (
        <div className="mt-3">
          <Elements stripe={stripeClient(setup.publishableKey)} options={{ clientSecret: setup.clientSecret }}>
            <CardConfirm
              onSaved={(saved) => {
                setSetup(null);
                setSavedMessage(`Saved ${saved.brand ?? "card"} ending ${saved.last4 ?? ""}.`);
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
          className="mt-3 inline-flex h-10 items-center rounded-full bg-[#064E3B] px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Opening card form..." : card ? "Replace card" : "Add a card"}
        </button>
      )}
    </div>
  );
}
