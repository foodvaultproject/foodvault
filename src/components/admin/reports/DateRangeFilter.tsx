"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DATE_PRESETS, type ReportDateRange } from "@/lib/admin/market-reports-shared";

export function DateRangeFilter({ range, basePath }: { range: ReportDateRange; basePath: string }) {
  const router = useRouter();
  const [from, setFrom] = useState(range.fromInput);
  const [to, setTo] = useState(range.toInput);
  const [customOpen, setCustomOpen] = useState(range.preset === "custom");

  function pushPreset(preset: string) {
    if (preset === "custom") {
      setCustomOpen(true);
      return;
    }
    setCustomOpen(false);
    const params = new URLSearchParams();
    params.set("range", preset);
    router.push(`${basePath}?${params.toString()}`);
  }

  function pushCustom() {
    const params = new URLSearchParams();
    params.set("range", "custom");
    params.set("from", from);
    params.set("to", to);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => pushPreset(preset.value)}
            className={`rounded-sm px-3 py-2 text-sm font-semibold ${
              (preset.value === "custom" ? customOpen : range.preset === preset.value && !customOpen)
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-white text-foreground"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      {customOpen ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-1 block rounded-md border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="mt-1 block rounded-md border border-border px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={pushCustom}
            className="rounded-sm bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            Apply
          </button>
        </div>
      ) : null}
    </div>
  );
}
