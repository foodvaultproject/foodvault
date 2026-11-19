"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { SavedCardForm } from "@/components/account/SavedCardForm";
import { formatNzPrice } from "@/lib/partner-offer";
import {
  aucklandToday,
  frequencyLabel,
  type ScheduleFrequency,
} from "@/lib/commerce/recurring-schedule-dates";
import type { SavedDeliveryDetails } from "@/lib/commerce/saved-delivery";
import {
  cancelSchedule,
  saveSchedule,
  searchScheduleProducts,
  setSchedulePaused,
  skipNextScheduleDelivery,
} from "@/lib/commerce/schedule-actions";
import type { ScheduleAddress, ScheduleRecord } from "@/lib/commerce/recurring-schedule-types";
import type { StockupCardSummary } from "@/lib/commerce/stockup-billing";
import { vaultMarketFreight } from "@/lib/commerce/shipping";

const DRAFT_KEY = "stockup.auto-restock-draft";

type DraftItem = {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
};

const EMPTY_ADDRESS: ScheduleAddress = {
  fullName: "",
  phone: "",
  email: "",
  street: "",
  suburb: "",
  city: "",
  postcode: "",
  deliveryNotes: "",
};

function addressFromSaved(saved: SavedDeliveryDetails | null, email: string): ScheduleAddress {
  return {
    fullName: saved?.fullName ?? "",
    phone: saved?.phone ?? "",
    email: saved?.email || email,
    street: saved?.street ?? "",
    suburb: saved?.suburb ?? "",
    city: saved?.city ?? "",
    postcode: saved?.postcode ?? "",
    deliveryNotes: saved?.deliveryNotes ?? "",
  };
}

function statusLabel(status: ScheduleRecord["status"]) {
  if (status === "ACTIVE") return "Active";
  if (status === "PAUSED") return "Paused";
  return "Cancelled";
}

function monthGrid(cursor: string) {
  const [year, month] = cursor.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startOffset = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<string | null> = Array.from({ length: startOffset }, () => null);
  for (let day = 1; day <= days; day += 1) {
    cells.push(new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10));
  }
  return { label: first.toLocaleDateString("en-NZ", { month: "long", year: "numeric", timeZone: "UTC" }), cells };
}

export function AutoRestockManager({
  email,
  card: initialCard,
  schedules,
  savedAddress,
  startNew,
  fromCart,
  seedProduct,
}: {
  email: string;
  card: StockupCardSummary | null;
  schedules: ScheduleRecord[];
  savedAddress: SavedDeliveryDetails | null;
  startNew: boolean;
  fromCart: boolean;
  seedProduct: DraftItem | null;
}) {
  const router = useRouter();
  const [card, setCard] = useState(initialCard);
  const [editing, setEditing] = useState<string | "new" | null>(startNew ? "new" : null);
  const [resumeOn, setResumeOn] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string }>, success: string) {
    setMessage("");
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage(success);
      router.refresh();
    });
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#064E3B]">StockUp</p>
            <h1 className="mt-1 text-3xl font-bold text-[#064E3B]">Auto-Restock</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Name a schedule, choose the pantry items, and pick weekly, fortnightly, monthly, every few days, or exact dates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex h-11 items-center rounded-full bg-[#064E3B] px-5 text-sm font-semibold text-white"
          >
            Create a New Schedule
          </button>
        </div>

        {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-4">
            {editing ? (
              <ScheduleEditor
                key={editing}
                email={email}
                savedAddress={savedAddress}
                schedule={editing === "new" ? null : schedules.find((item) => item.id === editing) ?? null}
                fromCart={editing === "new" && fromCart}
                seedProduct={editing === "new" ? seedProduct : null}
                onClose={() => setEditing(null)}
                onSaved={() => {
                  setEditing(null);
                  setMessage("Schedule saved");
                  router.refresh();
                }}
              />
            ) : null}

            {schedules.length === 0 && !editing ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
                No schedules yet. Create one for the staples you want delivered again.
              </p>
            ) : null}

            {schedules.map((schedule) => (
              <article key={schedule.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{schedule.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {frequencyLabel(schedule.frequencyType, schedule.intervalDays)}
                      {schedule.nextRunDate ? ` · Next delivery ${schedule.nextRunDate}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-[#064E3B]">
                    {statusLabel(schedule.status)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-700">
                  Estimated subtotal {formatNzPrice(schedule.subtotal)} · Freight{" "}
                  {schedule.freight === 0 ? "$0.00" : formatNzPrice(schedule.freight)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {card?.last4 ? `${card.brand ?? "Card"} ···· ${card.last4}` : "No saved card"}
                  {schedule.status === "PAUSED" && schedule.pausedUntil
                    ? ` · Auto-resume on ${schedule.pausedUntil}`
                    : ""}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {schedule.items.map((item) => (
                    <li key={item.productId}>
                      {item.quantity} × {item.name}
                      {item.available ? "" : " (unavailable)"}
                    </li>
                  ))}
                </ul>
                {schedule.status !== "CANCELLED" ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setEditing(schedule.id)}
                      className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        run(
                          () => skipNextScheduleDelivery(schedule.id),
                          "Next delivery skipped"
                        )
                      }
                      className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold"
                    >
                      Skip next delivery
                    </button>
                    {schedule.status === "PAUSED" ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => setSchedulePaused(schedule.id, false, null), "Schedule resumed")}
                        className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold"
                      >
                        Resume
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="date"
                          min={aucklandToday()}
                          value={resumeOn[schedule.id] ?? ""}
                          onChange={(event) =>
                            setResumeOn((current) => ({ ...current, [schedule.id]: event.target.value }))
                          }
                          aria-label={`Auto-resume date for ${schedule.name}`}
                          className="h-9 rounded-md border border-slate-300 px-2 text-sm"
                        />
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            run(
                              () => setSchedulePaused(schedule.id, true, resumeOn[schedule.id] || null),
                              "Schedule paused"
                            )
                          }
                          className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold"
                        >
                          Pause
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (!window.confirm(`Cancel ${schedule.name}? Future deliveries will stop.`)) return;
                        run(() => cancelSchedule(schedule.id), "Schedule cancelled");
                      }}
                      className="rounded-full px-3 py-1.5 text-sm font-semibold text-red-700"
                    >
                      Cancel schedule
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
          <SavedCardForm card={card} onSaved={setCard} />
        </div>
      </div>
    </div>
  );
}

function ScheduleEditor({
  email,
  savedAddress,
  schedule,
  fromCart,
  seedProduct,
  onClose,
  onSaved,
}: {
  email: string;
  savedAddress: SavedDeliveryDetails | null;
  schedule: ScheduleRecord | null;
  fromCart: boolean;
  seedProduct: DraftItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = aucklandToday();
  const [name, setName] = useState(schedule?.name ?? "");
  const [frequency, setFrequency] = useState<ScheduleFrequency>(schedule?.frequencyType ?? "WEEKLY");
  const [intervalDays, setIntervalDays] = useState(schedule?.intervalDays ?? 21);
  const [startDate, setStartDate] = useState(schedule?.nextRunDate ?? today);
  const [endDate, setEndDate] = useState(schedule?.endDate ?? "");
  const [customDates, setCustomDates] = useState<string[]>(
    schedule?.customDates.filter((date) => !date.skipped).map((date) => date.date) ?? []
  );
  const [month, setMonth] = useState(today.slice(0, 7));
  const [address, setAddress] = useState<ScheduleAddress>(
    schedule?.address ?? addressFromSaved(savedAddress, email)
  );
  const [items, setItems] = useState<DraftItem[]>(
    schedule?.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      brand: item.brand,
      price: item.unitPrice,
      quantity: item.quantity,
    })) ?? (seedProduct ? [seedProduct] : [])
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; name: string; brand: string; price: number }>>([]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const calendar = useMemo(() => monthGrid(`${month}-01`), [month]);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (schedule || !fromCart) return;
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(DRAFT_KEY);
    try {
      const parsed = JSON.parse(raw) as DraftItem[];
      if (Array.isArray(parsed)) setItems(parsed.filter((item) => item.productId && item.quantity > 0));
    } catch {
      setItems([]);
    }
  }, [fromCart, schedule]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void searchScheduleProducts(query).then(setResults);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  function addResult(result: { id: string; name: string; brand: string; price: number }) {
    setItems((current) => {
      const existing = current.find((item) => item.productId === result.id);
      if (existing) {
        return current.map((item) =>
          item.productId === result.id ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item
        );
      }
      return [
        ...current,
        {
          productId: result.id,
          name: result.name,
          brand: result.brand,
          price: result.price,
          quantity: 1,
        },
      ];
    });
    setQuery("");
    setResults([]);
  }

  function submit() {
    setError("");
    startTransition(async () => {
      const result = await saveSchedule({
        id: schedule?.id,
        name,
        frequencyType: frequency,
        intervalDays: frequency === "CUSTOM_INTERVAL" ? intervalDays : null,
        startDate,
        endDate: endDate || null,
        customDates,
        address,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <form
      className="rounded-xl border border-[#064E3B]/20 bg-emerald-50/40 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#064E3B]">{schedule ? "Edit schedule" : "New schedule"}</h2>
        <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-600">
          Close
        </button>
      </div>
      <label className="mt-3 block text-sm font-semibold text-slate-800">
        Name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Weekly Essentials"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-3 block text-sm font-semibold text-slate-800">
        Frequency
        <select
          value={frequency}
          onChange={(event) => setFrequency(event.target.value as ScheduleFrequency)}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="WEEKLY">Weekly</option>
          <option value="FORTNIGHTLY">Fortnightly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="CUSTOM_INTERVAL">Every X days</option>
          <option value="CUSTOM_DATES">Custom dates</option>
        </select>
      </label>

      {frequency === "CUSTOM_INTERVAL" ? (
        <label className="mt-3 block text-sm font-semibold text-slate-800">
          Days between deliveries
          <input
            type="number"
            min={1}
            max={365}
            value={intervalDays}
            onChange={(event) => setIntervalDays(Number(event.target.value))}
            className="mt-1 w-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>
      ) : null}

      {frequency === "CUSTOM_DATES" ? (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Delivery dates</p>
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setMonth((current) => shiftMonth(current, -1))}
                className="rounded border border-slate-300 bg-white px-2"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setMonth((current) => shiftMonth(current, 1))}
                className="rounded border border-slate-300 bg-white px-2"
              >
                Next
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-600">{calendar.label}</p>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day} className="font-semibold text-slate-500">
                {day}
              </span>
            ))}
            {calendar.cells.map((date, index) =>
              date ? (
                <button
                  key={date}
                  type="button"
                  disabled={date < today}
                  onClick={() =>
                    setCustomDates((current) =>
                      current.includes(date) ? current.filter((item) => item !== date) : [...current, date].sort()
                    )
                  }
                  className={`h-8 rounded ${
                    customDates.includes(date) ? "bg-[#064E3B] text-white" : "bg-white text-slate-800"
                  } disabled:opacity-40`}
                >
                  {Number(date.slice(-2))}
                </button>
              ) : (
                <span key={`empty-${index}`} />
              )
            )}
          </div>
          <p className="mt-2 text-xs text-slate-600">{customDates.length} date{customDates.length === 1 ? "" : "s"} selected</p>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-800">
            Start date
            <input
              type="date"
              min={today}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            End date (optional)
            <input
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}

      <div className="mt-4">
        <label className="text-sm font-semibold text-slate-800">
          Add products
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search oats, coffee, olive oil"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>
        {results.length > 0 ? (
          <ul className="mt-2 overflow-hidden rounded-md border border-slate-200 bg-white">
            {results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => addResult(result)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-emerald-50"
                >
                  <span>
                    {result.brand} {result.name}
                  </span>
                  <span>{formatNzPrice(result.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm">
              <span>
                {item.name}
                <span className="ml-2 text-slate-500">{formatNzPrice(item.price)}</span>
              </span>
              <span className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={item.quantity}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((line) =>
                        line.productId === item.productId
                          ? { ...line, quantity: Math.min(99, Math.max(1, Number(event.target.value) || 1)) }
                          : line
                      )
                    )
                  }
                  className="w-16 rounded border border-slate-300 px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => setItems((current) => current.filter((line) => line.productId !== item.productId))}
                  className="text-xs font-semibold text-red-700"
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-slate-700">
          Estimated subtotal {formatNzPrice(subtotal)} · Freight{" "}
          {vaultMarketFreight(subtotal) === 0 ? "$0.00" : formatNzPrice(vaultMarketFreight(subtotal))}
        </p>
      </div>

      <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
        <legend className="text-sm font-semibold text-slate-800">Delivery address</legend>
        {(
          [
            ["fullName", "Full name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["street", "Street"],
            ["suburb", "Suburb"],
            ["city", "City"],
            ["postcode", "Postcode"],
            ["deliveryNotes", "Delivery notes"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm text-slate-700">
            {label}
            <input
              value={address[key]}
              onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            />
          </label>
        ))}
      </fieldset>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex h-11 items-center rounded-full bg-[#064E3B] px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save schedule"}
      </button>
    </form>
  );
}

function shiftMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}
