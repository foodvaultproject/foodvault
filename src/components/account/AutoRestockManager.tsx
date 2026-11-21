"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { SavedCardForm } from "@/components/account/SavedCardForm";
import { SafeImage } from "@/components/media/SafeImage";
import { usePantryMarket } from "@/components/pantry/PantryMarketProvider";
import {
  catalogSlug,
  filterCatalogProducts,
  getVaultMarketBrowseDepartments,
  offerPrice,
  resolveProductDepartment,
} from "@/lib/commerce/catalog";
import { formatNzPrice } from "@/lib/partner-offer";
import {
  advanceScheduleDate,
  aucklandToday,
  frequencyLabel,
  type ScheduleFrequency,
} from "@/lib/commerce/recurring-schedule-dates";
import type { SavedDeliveryDetails } from "@/lib/commerce/saved-delivery";
import {
  cancelSchedule,
  saveSchedule,
  setSchedulePaused,
  skipNextScheduleDelivery,
} from "@/lib/commerce/schedule-actions";
import type { ScheduleAddress, ScheduleRecord } from "@/lib/commerce/recurring-schedule-types";
import type { StockupCardSummary } from "@/lib/commerce/stockup-billing";
import { vaultMarketFreight } from "@/lib/commerce/shipping";
import type { FoodVaultProduct } from "@/types/commerce";

const DRAFT_KEY = "stockup.auto-restock-draft";

type DraftItem = {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
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
  const [scheduleList, setScheduleList] = useState(schedules);
  const [skipNotice, setSkipNotice] = useState<{ schedule: ScheduleRecord; nextRunDate: string | null } | null>(null);
  const [pauseNotice, setPauseNotice] = useState<{ schedule: ScheduleRecord; resume: boolean; resumeDate: string | null } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ScheduleRecord | null>(null);

  useEffect(() => {
    setScheduleList(schedules);
  }, [schedules]);

  function updateSchedule(id: string, patch: Partial<ScheduleRecord>) {
    setScheduleList((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip bg-white">
      <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-8 sm:px-6">
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

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-4">
            {editing ? (
              <ScheduleEditor
                key={editing}
                email={email}
                savedAddress={savedAddress}
                schedule={editing === "new" ? null : scheduleList.find((item) => item.id === editing) ?? null}
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

            {scheduleList.filter((schedule) => schedule.status !== "CANCELLED").length === 0 && !editing ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
                No schedules yet. Create one for the staples you want delivered again.
              </p>
            ) : null}

            {scheduleList
              .filter((schedule) => schedule.status !== "CANCELLED")
              .map((schedule) => (
              <article key={schedule.id} className="min-w-0 rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{schedule.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {schedule.status === "PAUSED"
                        ? "Schedule currently paused — no deliveries scheduled"
                        : `${frequencyLabel(schedule.frequencyType, schedule.intervalDays)}${
                            schedule.nextRunDate ? ` · Next delivery ${schedule.nextRunDate}` : ""
                          }`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      schedule.status === "PAUSED"
                        ? "bg-orange-500 text-white"
                        : "bg-emerald-50 text-[#064E3B]"
                    }`}
                  >
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
                <ul className="mt-3 flex min-w-0 max-w-full gap-3 overflow-x-auto pb-1">
                  {schedule.items.map((item) => (
                    <li key={item.productId} className="w-28 shrink-0">
                      <span className="relative block aspect-square overflow-hidden rounded-md bg-slate-100">
                        <SafeImage
                          src={item.imageUrl ?? ""}
                          alt=""
                          fill
                          sizes="112px"
                          className="object-cover"
                          fallbackVariant="muted"
                        />
                      </span>
                      <span className="mt-1 block line-clamp-2 text-xs font-semibold text-slate-900">
                        {item.quantity} × {item.name}
                      </span>
                      {item.available ? null : (
                        <span className="mt-0.5 block text-[11px] text-red-700">Unavailable</span>
                      )}
                    </li>
                  ))}
                </ul>
                {schedule.status !== "CANCELLED" ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(schedule.id)}
                      className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const skipped = previewSkippedDelivery(schedule);
                        setSkipNotice({ schedule, nextRunDate: skipped.nextRunDate });
                      }}
                      className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold"
                    >
                      Skip next delivery
                    </button>
                    {schedule.status === "PAUSED" ? (
                      <button
                        type="button"
                        onClick={() => setPauseNotice({ schedule, resume: true, resumeDate: null })}
                        className="rounded-full bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white"
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
                          className="h-9 w-full min-w-0 max-w-full rounded-md border border-slate-300 px-2 text-sm sm:w-auto"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPauseNotice({
                              schedule,
                              resume: false,
                              resumeDate: resumeOn[schedule.id] || null,
                            })
                          }
                          className="rounded-full bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white"
                        >
                          Pause
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setCancelTarget(schedule)}
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
      {cancelTarget ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-schedule-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="cancel-schedule-title" className="text-lg font-bold text-slate-900">
              Cancel this schedule?
            </h2>
            <p className="mt-2 text-sm text-slate-700">
              Cancelling {cancelTarget.name} cannot be undone. Future deliveries will stop.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="inline-flex h-10 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800"
              >
                Keep schedule
              </button>
              <button
                type="button"
                onClick={() => {
                  const removed = cancelTarget;
                  setCancelTarget(null);
                  setScheduleList((current) => current.filter((item) => item.id !== removed.id));
                  if (editing === removed.id) setEditing(null);
                  void cancelSchedule(removed.id).then((result) => {
                    if (!result.error) return;
                    setScheduleList((current) => [removed, ...current]);
                    setMessage(result.error);
                  });
                }}
                className="inline-flex h-10 items-center rounded-full bg-red-700 px-5 text-sm font-semibold text-white"
              >
                Cancel schedule
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {skipNotice ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="skip-delivery-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="skip-delivery-title" className="text-lg font-bold text-[#064E3B]">
              Skip the next delivery?
            </h2>
            <p className="mt-2 text-sm text-slate-700">
              {skipNotice.schedule.name} will skip this delivery. The next one will be{" "}
              {skipNotice.nextRunDate ? formatScheduleDate(skipNotice.nextRunDate) : "not scheduled"}.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSkipNotice(null)}
                className="inline-flex h-10 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const pending = skipNotice;
                  const previous = pending.schedule;
                  const skipped = previewSkippedDelivery(previous);
                  setSkipNotice(null);
                  updateSchedule(previous.id, skipped);
                  void skipNextScheduleDelivery(previous.id).then((result) => {
                    if (!result.error) {
                      if ((result.nextRunDate ?? null) !== skipped.nextRunDate) {
                        updateSchedule(previous.id, { nextRunDate: result.nextRunDate ?? null });
                      }
                      return;
                    }
                    updateSchedule(previous.id, {
                      nextRunDate: previous.nextRunDate,
                      customDates: previous.customDates,
                    });
                    setMessage(result.error);
                  });
                }}
                className="inline-flex h-10 items-center rounded-full bg-[#064E3B] px-5 text-sm font-semibold text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {pauseNotice ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pause-schedule-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="pause-schedule-title" className="text-lg font-bold text-[#064E3B]">
              {pauseNotice.resume ? "Resume this schedule?" : "Pause this schedule?"}
            </h2>
            <p className="mt-2 text-sm text-slate-700">
              {pauseNotice.resume
                ? `Resuming ${pauseNotice.schedule.name} turns deliveries back on. The next delivery stays on ${
                    pauseNotice.schedule.nextRunDate
                      ? formatScheduleDate(pauseNotice.schedule.nextRunDate)
                      : "its current date"
                  }.`
                : `Pausing ${pauseNotice.schedule.name} stops deliveries. Nothing is ordered until you resume.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPauseNotice(null)}
                className="inline-flex h-10 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const pending = pauseNotice;
                  setPauseNotice(null);
                  if (pending.resume) {
                    updateSchedule(pending.schedule.id, { status: "ACTIVE", pausedUntil: null });
                    void setSchedulePaused(pending.schedule.id, false, null).then((result) => {
                      if (!result.error) return;
                      updateSchedule(pending.schedule.id, {
                        status: "PAUSED",
                        pausedUntil: pending.schedule.pausedUntil,
                      });
                      setMessage(result.error);
                    });
                    return;
                  }
                  updateSchedule(pending.schedule.id, {
                    status: "PAUSED",
                    pausedUntil: pending.resumeDate,
                  });
                  void setSchedulePaused(pending.schedule.id, true, pending.resumeDate).then((result) => {
                    if (!result.error) return;
                    updateSchedule(pending.schedule.id, { status: "ACTIVE", pausedUntil: null });
                    setMessage(result.error);
                  });
                }}
                className="inline-flex h-10 items-center rounded-full bg-[#064E3B] px-5 text-sm font-semibold text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function previewSkippedDelivery(schedule: ScheduleRecord): Pick<ScheduleRecord, "nextRunDate" | "customDates"> {
  const today = aucklandToday();
  if (schedule.frequencyType === "CUSTOM_DATES") {
    const upcoming = schedule.customDates
      .filter((date) => !date.skipped && date.date >= today)
      .sort((left, right) => left.date.localeCompare(right.date));
    const skipped = upcoming[0];
    if (!skipped) return { nextRunDate: null, customDates: schedule.customDates };
    return {
      nextRunDate: upcoming[1]?.date ?? null,
      customDates: schedule.customDates.map((date) =>
        date.date === skipped.date ? { ...date, skipped: true } : date
      ),
    };
  }
  const current = schedule.nextRunDate || today;
  return {
    nextRunDate: advanceScheduleDate(current, schedule.frequencyType, schedule.intervalDays),
    customDates: schedule.customDates,
  };
}

function formatScheduleDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
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
      imageUrl: item.imageUrl,
    })) ?? (seedProduct ? [seedProduct] : [])
  );
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [specific, setSpecific] = useState("");
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

  function addProduct(product: FoodVaultProduct) {
    if (product.stock_quantity <= 0) return;
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          brand: product.brand,
          price: offerPrice(product),
          quantity: 1,
          imageUrl: product.image_url,
        },
      ];
    });
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
      className="min-w-0 max-w-full overflow-x-clip rounded-xl border border-[#064E3B]/20 bg-emerald-50/40 p-4"
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
              className="mt-1 box-border w-full min-w-0 max-w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            End date (optional)
            <input
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1 box-border w-full min-w-0 max-w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}

      <ScheduleProductPicker
        query={query}
        department={department}
        subcategory={subcategory}
        specific={specific}
        onQuery={setQuery}
        onDepartment={(value) => {
          setDepartment(value);
          setSubcategory("");
          setSpecific("");
        }}
        onSubcategory={(value) => {
          setSubcategory(value);
          setSpecific("");
        }}
        onSpecific={setSpecific}
        onAdd={addProduct}
        addedIds={items.map((item) => item.productId)}
      />

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

      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-800">Items on this schedule</p>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Added products appear here before you save.</p>
        ) : (
          <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3 rounded-md bg-white p-2">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  <SafeImage
                    src={item.imageUrl ?? ""}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    fallbackVariant="muted"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-semibold text-slate-900">{item.name}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      aria-label={`Quantity for ${item.name}`}
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
                      className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setItems((current) => current.filter((line) => line.productId !== item.productId))}
                      className="text-xs font-semibold text-red-700"
                    >
                      Remove
                    </button>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-sm text-slate-700">
          Estimated subtotal {formatNzPrice(subtotal)} · Freight{" "}
          {vaultMarketFreight(subtotal) === 0 ? "$0.00" : formatNzPrice(vaultMarketFreight(subtotal))}
        </p>
      </div>

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

function ScheduleProductPicker({
  query,
  department,
  subcategory,
  specific,
  onQuery,
  onDepartment,
  onSubcategory,
  onSpecific,
  onAdd,
  addedIds,
}: {
  query: string;
  department: string;
  subcategory: string;
  specific: string;
  onQuery: (value: string) => void;
  onDepartment: (value: string) => void;
  onSubcategory: (value: string) => void;
  onSpecific: (value: string) => void;
  onAdd: (product: FoodVaultProduct) => void;
  addedIds: string[];
}) {
  const { products } = usePantryMarket();
  const departments = useMemo(() => {
    return getVaultMarketBrowseDepartments().filter((entry) =>
      products.some(
        (product) =>
          product.is_active && catalogSlug(resolveProductDepartment(product)) === entry.slug
      )
    );
  }, [products]);
  const activeDepartment = departments.find((entry) => entry.slug === department) ?? null;
  const activeSubcategory =
    activeDepartment?.subcategories.find((entry) => entry.slug === subcategory) ?? null;
  const selectionMade = Boolean(department || query.trim().length >= 2);
  const matches = useMemo(() => {
    if (!selectionMade) return [];
    return filterCatalogProducts(
      products.filter((product) => product.is_active),
      {
        query: query.trim().length >= 2 ? query : "",
        department,
        subcategory,
        specific,
      }
    );
  }, [department, products, query, selectionMade, specific, subcategory]);

  return (
    <div className="mt-4">
      <p className="text-sm font-semibold text-slate-800">Add products</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <label className="text-sm text-slate-700">
          Department
          <select
            value={department}
            onChange={(event) => onDepartment(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option value="">Choose a department</option>
            {departments.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.department}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-700">
          Subcategory
          <select
            value={subcategory}
            disabled={!activeDepartment}
            onChange={(event) => onSubcategory(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 disabled:opacity-50"
          >
            <option value="">All subcategories</option>
            {activeDepartment?.subcategories.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-700">
          Specific
          <select
            value={specific}
            disabled={!activeSubcategory}
            onChange={(event) => onSpecific(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 disabled:opacity-50"
          >
            <option value="">All</option>
            {activeSubcategory?.specifics.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-3 block text-sm text-slate-700">
        Search
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search products"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
        />
      </label>
      {selectionMade ? (
        matches.length > 0 ? (
          <ul className="mt-3 grid max-h-[32rem] min-w-0 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {matches.map((product) => {
              const outOfStock = product.stock_quantity <= 0;
              const added = addedIds.includes(product.id);
              return (
                <li key={product.id} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <span className="relative aspect-square bg-slate-100">
                    <SafeImage
                      src={product.image_url ?? ""}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                      fallbackVariant="muted"
                    />
                  </span>
                  <span className="flex flex-1 flex-col p-2">
                    <span className="text-[11px] font-semibold uppercase text-[#064E3B]">{product.brand}</span>
                    <span className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</span>
                    <span className="mt-1 text-sm font-bold text-[#064E3B]">{formatNzPrice(offerPrice(product))}</span>
                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => onAdd(product)}
                      className={`mt-2 inline-flex h-9 items-center justify-center rounded-sm px-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                        added ? "bg-orange-500" : "bg-[#064E3B]"
                      }`}
                    >
                      {outOfStock ? "Out of stock" : added ? "Added" : "Add to Schedule"}
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">No products match that selection.</p>
        )
      ) : (
        <p className="mt-3 text-sm text-slate-600">Choose a department to see products.</p>
      )}
    </div>
  );
}

function shiftMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}
