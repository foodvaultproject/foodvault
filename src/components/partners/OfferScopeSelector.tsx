"use client";

import type { OfferScope } from "@/lib/partner-offer";

type OfferScopeSelectorProps = {
  value: OfferScope;
  onChange: (scope: OfferScope) => void;
  disabled?: boolean;
  name?: string;
};

const OPTIONS: { value: OfferScope; label: string }[] = [
  { value: "entire_store", label: "Entire Store" },
  { value: "selected_products", label: "Selected Products" },
];

export function OfferScopeSelector({
  value,
  onChange,
  disabled = false,
  name = "offerScope",
}: OfferScopeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Discount applies to"
      className="flex flex-wrap gap-2"
    >
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <label
            key={option.value}
            className={`inline-flex cursor-pointer items-center rounded-sm border px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:border-primary/30"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={active}
              disabled={disabled}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
