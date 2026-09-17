"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AddressAutocomplete } from "@/components/common/AddressAutocomplete";
import { SafeImage } from "@/components/media/SafeImage";
import { usePantryMarket } from "@/components/pantry/PantryMarketProvider";
import { cartMemberSavings, cartMemberSubtotal } from "@/lib/commerce/cart";
import {
  amountToFreeShipping,
  qualifiesForFreeShipping,
  vaultMarketFreight,
} from "@/lib/commerce/shipping";
import { extractNzPostcode } from "@/lib/hospitality/types";
import { formatNzPrice } from "@/lib/partner-offer";
import { heading1, inputBase } from "@/lib/ui-classes";

const fieldClass = `${inputBase} text-sm`;
const labelClass = "text-sm font-bold text-foreground";

type DeliveryForm = {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  suburb: string;
  city: string;
  postcode: string;
  deliveryNotes: string;
};

const EMPTY_DELIVERY: DeliveryForm = {
  fullName: "",
  phone: "",
  email: "",
  street: "",
  suburb: "",
  city: "",
  postcode: "",
  deliveryNotes: "",
};

export function VaultMarketCheckout() {
  const router = useRouter();
  const { cart, memberUnlocked } = usePantryMarket();
  const [delivery, setDelivery] = useState<DeliveryForm>(EMPTY_DELIVERY);
  const [lookupValue, setLookupValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cartMemberSubtotal(cart);
  const savings = cartMemberSavings(cart);
  const freight = vaultMarketFreight(subtotal);
  const remainingToFree = amountToFreeShipping(subtotal);
  const freeShipping = qualifiesForFreeShipping(subtotal);
  const total = subtotal + freight;

  const canSubmit = useMemo(
    () =>
      cart.length > 0 &&
      Boolean(
        delivery.fullName.trim() &&
          delivery.phone.trim() &&
          delivery.email.trim() &&
          delivery.street.trim() &&
          delivery.suburb.trim() &&
          delivery.city.trim() &&
          delivery.postcode.trim()
      ),
    [cart.length, delivery]
  );

  function updateField<K extends keyof DeliveryForm>(key: K, value: DeliveryForm[K]) {
    setDelivery((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    if (!memberUnlocked) {
      setError("An active FoodVault membership is required for Vault Market checkout.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/pantry/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product_id,
            quantity: item.quantity,
          })),
          delivery,
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Unable to start checkout.");
        setSubmitting(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Unable to start checkout.");
      setSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.08em] text-vm-primary">
          Vault Market
        </p>
        <h1 className={`${heading1} mt-2`}>Your cart is empty</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Add pantry items before continuing to checkout.
        </p>
        <Link
          href="/pantry"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-sm bg-vm-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-vm-surface"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-medium uppercase tracking-[0.08em] text-vm-primary">
        Vault Market
      </p>
      <h1 className={`${heading1} mt-2`}>Checkout</h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        Confirm delivery details, then continue to Stripe to pay in NZD.
      </p>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]"
      >
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-background p-5 sm:p-6">
            <h2 className="text-lg font-bold text-foreground">Recipient details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-name" className={labelClass}>
                  Full name
                </label>
                <input
                  id="checkout-name"
                  name="fullName"
                  autoComplete="name"
                  required
                  value={delivery.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className={`mt-1 ${fieldClass}`}
                />
              </div>
              <div>
                <label htmlFor="checkout-phone" className={labelClass}>
                  Phone number
                </label>
                <input
                  id="checkout-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={delivery.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className={`mt-1 ${fieldClass}`}
                />
              </div>
              <div>
                <label htmlFor="checkout-email" className={labelClass}>
                  Email address
                </label>
                <input
                  id="checkout-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={delivery.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={`mt-1 ${fieldClass}`}
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-background p-5 sm:p-6">
            <h2 className="text-lg font-bold text-foreground">Delivery address</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start typing a New Zealand street address, then confirm suburb, city, and postcode.
            </p>
            <div className="mt-4 space-y-4">
              <AddressAutocomplete
                value={lookupValue}
                label="Find your street"
                placeholder="Start typing a street, suburb, or city"
                onSelectAddress={(formattedAddress, details) => {
                  setLookupValue(formattedAddress);
                  updateField("street", details?.street?.trim() || formattedAddress.split(",")[0]?.trim() || formattedAddress);
                  updateField("suburb", details?.suburb?.trim() || "");
                  updateField("city", details?.city?.trim() || details?.region?.trim() || "");
                  updateField(
                    "postcode",
                    extractNzPostcode(formattedAddress) ||
                      extractNzPostcode(details?.displayName ?? "")
                  );
                }}
              />
              <div>
                <label htmlFor="checkout-street" className={labelClass}>
                  Street
                </label>
                <input
                  id="checkout-street"
                  name="street"
                  autoComplete="address-line1"
                  required
                  value={delivery.street}
                  onChange={(event) => updateField("street", event.target.value)}
                  className={`mt-1 ${fieldClass}`}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="checkout-suburb" className={labelClass}>
                    Suburb
                  </label>
                  <input
                    id="checkout-suburb"
                    name="suburb"
                    autoComplete="address-level3"
                    required
                    value={delivery.suburb}
                    onChange={(event) => updateField("suburb", event.target.value)}
                    className={`mt-1 ${fieldClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-city" className={labelClass}>
                    City
                  </label>
                  <input
                    id="checkout-city"
                    name="city"
                    autoComplete="address-level2"
                    required
                    value={delivery.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    className={`mt-1 ${fieldClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-postcode" className={labelClass}>
                    Postcode
                  </label>
                  <input
                    id="checkout-postcode"
                    name="postcode"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    required
                    value={delivery.postcode}
                    onChange={(event) => updateField("postcode", event.target.value)}
                    className={`mt-1 ${fieldClass}`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="checkout-notes" className={labelClass}>
                  Special instructions / delivery notes
                </label>
                <textarea
                  id="checkout-notes"
                  name="deliveryNotes"
                  rows={4}
                  value={delivery.deliveryNotes}
                  onChange={(event) => updateField("deliveryNotes", event.target.value)}
                  placeholder="Gate code, preferred drop-off, or other notes for the driver"
                  className={`mt-1 ${fieldClass} min-h-24`}
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-background p-5 sm:p-6 lg:sticky lg:top-[calc(8rem+26px)]">
          <h2 className="text-lg font-bold text-foreground">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {cart.map((item) => (
              <li key={item.product_id} className="flex gap-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface">
                  <SafeImage
                    src={item.image_url ?? ""}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                    fallbackVariant="muted"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted">Qty {item.quantity}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  {formatNzPrice(item.member_price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {freeShipping ? (
            <p className="mt-4 rounded-md bg-success-light px-3 py-2 text-sm font-semibold text-success">
              Free NZ Shipping unlocked
            </p>
          ) : (
            <p className="mt-4 rounded-md bg-[#10B981]/10 px-3 py-2 text-sm text-foreground">
              Add{" "}
              <span className="font-bold">${remainingToFree.toFixed(2)}</span> more to
              claim Free Shipping!{" "}
              <button
                type="button"
                onClick={() => router.push("/pantry")}
                className="font-semibold text-[#059669] underline-offset-2 hover:underline"
              >
                Continue Shopping
              </button>
            </p>
          )}

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold">{formatNzPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Freight</dt>
              <dd className="font-semibold">
                {freight === 0 ? "FREE" : formatNzPrice(freight)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Member savings</dt>
              <dd className="font-semibold text-success">{formatNzPrice(savings)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-bold">{formatNzPrice(total)}</dd>
            </div>
          </dl>

          {error ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-sm bg-vm-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-vm-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Redirecting to Stripe..." : "Pay with Stripe"}
          </button>
          <Link
            href="/pantry"
            className="mt-3 inline-flex w-full items-center justify-center text-sm font-semibold text-muted hover:text-foreground"
          >
            Continue Shopping
          </Link>
        </aside>
      </form>
    </div>
  );
}
