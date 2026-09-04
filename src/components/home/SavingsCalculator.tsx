"use client";

import { useMemo, useState } from "react";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import { SECTION_PY_HOME_PARTNER, SECTION_PY_HOME_REFINE } from "@/components/home/section-spacing";
import { heading2 } from "@/lib/ui-classes";

const SAVINGS_RATE = 0.15;
const MEMBERSHIP_COST = 8.99;

const CATEGORIES = [
  { key: "petFood", label: "Pet Food", defaultValue: 50, max: 400 },
  { key: "meatProduce", label: "Meat, Fruit & Veges", defaultValue: 220, max: 800 },
  { key: "cafes", label: "Cafes & Restaurants", defaultValue: 100, max: 600 },
  { key: "gifts", label: "Gifts & Hampers", defaultValue: 30, max: 300 },
  { key: "pantry", label: "Artisan & Specialty Pantry", defaultValue: 45, max: 400 },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];
type SpendState = Record<CategoryKey, number>;

function roundCents(value: number) {
  return Math.round(value * 100) / 100;
}

function formatDollars(amount: number) {
  const formatted = Math.abs(amount).toLocaleString("en-NZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getSignupScore(netMonthlySavings: number) {
  if (netMonthlySavings > 50) {
    return { label: "Crazy not to! 🔥", className: "bg-warning text-navy" };
  }
  if (netMonthlySavings >= 0.01) {
    return { label: "Pays for itself & then some! ☕", className: "bg-success-light text-success" };
  }
  return { label: "Damn, living on the noodles cuz! 🍜", className: "bg-white/15 text-white" };
}

const defaultSpend = Object.fromEntries(
  CATEGORIES.map((category) => [category.key, category.defaultValue])
) as SpendState;

export function SavingsCalculator({ compactSpacing = false }: { compactSpacing?: boolean }) {
  const [spend, setSpend] = useState<SpendState>(defaultSpend);

  const totals = useMemo(() => {
    const totalMonthlySpend = CATEGORIES.reduce((sum, category) => sum + spend[category.key], 0);
    const grossMonthlySavings = roundCents(totalMonthlySpend * SAVINGS_RATE);
    const netMonthlySavings = roundCents(grossMonthlySavings - MEMBERSHIP_COST);
    const netYearlySavings = roundCents(netMonthlySavings * 12);

    return {
      totalMonthlySpend,
      netMonthlySavings,
      netYearlySavings,
    };
  }, [spend]);

  const score = getSignupScore(totals.netMonthlySavings);

  function updateSpend(key: CategoryKey, value: number, max: number) {
    setSpend((current) => ({
      ...current,
      [key]: clamp(roundCents(value), 0, max),
    }));
  }

  return (
    <section
      className={`bg-background ${compactSpacing ? SECTION_PY_HOME_PARTNER : SECTION_PY_HOME_REFINE}`}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className={compactSpacing ? "mb-2.5" : "mb-5"}>
          <h2 className={heading2}>How much could you save?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estimate your FoodVault savings from everyday Kiwi spending.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch">
          <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly spend
            </p>
            <div className="mt-4 space-y-5">
              {CATEGORIES.map((category) => {
                const value = spend[category.key];
                const percent = category.max > 0 ? (value / category.max) * 100 : 0;

                return (
                  <div key={category.key}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        htmlFor={`savings-${category.key}`}
                        className="text-sm font-medium text-foreground"
                      >
                        {category.label}
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <input
                          id={`savings-${category.key}-amount`}
                          type="number"
                          min={0}
                          max={category.max}
                          step={1}
                          inputMode="decimal"
                          value={value}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            updateSpend(category.key, Number.isFinite(next) ? next : 0, category.max);
                          }}
                          className="w-[5.75rem] rounded-md border border-border bg-background py-1.5 pl-5 pr-2 text-right text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
                          aria-label={`${category.label} dollars per month`}
                        />
                      </div>
                    </div>
                    <input
                      id={`savings-${category.key}`}
                      type="range"
                      min={0}
                      max={category.max}
                      step={1}
                      value={value}
                      onChange={(event) => updateSpend(category.key, Number(event.target.value), category.max)}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full accent-primary"
                      style={{
                        background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percent}%, #e7e2ff ${percent}%, #e7e2ff 100%)`,
                      }}
                      aria-valuemin={0}
                      aria-valuemax={category.max}
                      aria-valuenow={value}
                      aria-valuetext={`${formatDollars(value)} per month`}
                    />
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Total monthly spend{" "}
              <span className="font-semibold text-foreground">
                {formatDollars(totals.totalMonthlySpend)}
              </span>
            </p>
          </div>

          <div className="flex flex-col rounded-xl bg-navy p-5 text-white shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Your estimated savings
            </p>
            <p
              className={`mt-3 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${score.className}`}
            >
              {score.label}
            </p>
            <p className="mt-4 text-lg font-bold leading-snug sm:text-xl">
              You could save {formatDollars(totals.netMonthlySavings)}/month (after $
              {MEMBERSHIP_COST.toFixed(2)} membership) or {formatDollars(totals.netYearlySavings)} a
              year!
            </p>
            <MemberSignupCtaLink
              variant="start-saving-now"
              className="fv-btn-primary mt-6 inline-flex w-full items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 sm:w-auto"
            >
              Start Saving Now
            </MemberSignupCtaLink>
            <p className="mt-auto pt-5 text-xs leading-relaxed text-white/60">
              *Savings based on an average 15% discount across participating FoodVault brands and
              venues.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
