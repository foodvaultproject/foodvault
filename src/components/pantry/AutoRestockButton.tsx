"use client";

import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { addProductToSchedule, listScheduleChoices } from "@/lib/commerce/schedule-actions";
import type { ScheduleChoice } from "@/lib/commerce/recurring-schedule-types";

type Access = { authenticated: boolean; schedules: ScheduleChoice[] };

let accessRequest: Promise<Access> | null = null;

function loadAccess() {
  if (!accessRequest) {
    accessRequest = listScheduleChoices().catch(() => ({ authenticated: false, schedules: [] }));
  }
  return accessRequest;
}

export function refreshAutoRestockAccess() {
  accessRequest = null;
  return loadAccess();
}

export function AutoRestockButton({
  productId,
  productName,
  quantity = 1,
  compact = false,
}: {
  productId: string;
  productName: string;
  quantity?: number;
  compact?: boolean;
}) {
  const menuId = useId();
  const [stockup, setStockup] = useState(false);
  const [open, setOpen] = useState(false);
  const [access, setAccess] = useState<Access | null>(null);
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState("");

  useEffect(() => {
    setStockup(document.documentElement.classList.contains("stockup"));
  }, []);

  useEffect(() => {
    if (!open || access) return;
    void loadAccess().then(setAccess);
  }, [open, access]);

  if (!stockup) return null;

  const createHref = `/account/schedules?new=1&productId=${encodeURIComponent(productId)}&qty=${quantity}`;
  const loginHref = `/login?next=${encodeURIComponent(createHref)}`;
  const signupHref = `/login?mode=signup&next=${encodeURIComponent(createHref)}`;

  async function addTo(schedule: ScheduleChoice) {
    setPendingId(schedule.id);
    setMessage("");
    const result = await addProductToSchedule(schedule.id, productId, quantity);
    setPendingId("");
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setMessage(`Added to ${schedule.name}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className={
          compact
            ? "inline-flex h-9 w-full items-center justify-center gap-1 rounded-sm border border-[#064E3B]/30 px-2 text-xs font-semibold text-[#064E3B] hover:bg-emerald-50"
            : "inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-[#064E3B]/30 px-4 text-sm font-semibold text-[#064E3B] hover:bg-emerald-50"
        }
      >
        <CalendarClock className="h-4 w-4" aria-hidden="true" />
        Auto-Restock
      </button>
      {open ? (
        <div
          id={menuId}
          className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-lg"
        >
          <p className="text-sm font-semibold text-slate-900">Add {productName}</p>
          {access === null ? <p className="mt-2 text-sm text-slate-500">Loading schedules...</p> : null}
          {access && !access.authenticated ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-slate-600">
                Sign in or create a StockUp account to put this item on a recurring schedule.
              </p>
              <Link href={loginHref} className="block text-sm font-semibold text-[#064E3B] hover:underline">
                Sign in
              </Link>
              <Link href={signupHref} className="block text-sm font-semibold text-[#064E3B] hover:underline">
                Create account
              </Link>
            </div>
          ) : null}
          {access?.authenticated ? (
            <div className="mt-2 space-y-1">
              {access.schedules.length === 0 ? (
                <p className="text-sm text-slate-500">You do not have a schedule yet.</p>
              ) : (
                access.schedules.map((schedule) => (
                  <button
                    key={schedule.id}
                    type="button"
                    disabled={pendingId === schedule.id}
                    onClick={() => void addTo(schedule)}
                    className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-emerald-50 disabled:opacity-60"
                  >
                    <span className="font-semibold text-slate-900">{schedule.name}</span>
                    <span className="ml-2 text-xs uppercase text-slate-500">{schedule.status === "PAUSED" ? "Paused" : "Active"}</span>
                  </button>
                ))
              )}
              <Link href={createHref} className="mt-2 block text-sm font-semibold text-[#064E3B] hover:underline">
                + Create new schedule with this item
              </Link>
            </div>
          ) : null}
          {message ? <p className="mt-2 text-xs text-slate-600">{message}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
