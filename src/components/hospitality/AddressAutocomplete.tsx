"use client";

import { useEffect, useId, useState } from "react";
import { NZ_REGIONS } from "@/lib/hospitality/constants";
import type { HospitalityLocation } from "@/lib/hospitality/types";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "text-sm font-bold text-foreground";

type AddressAutocompleteProps = {
  value: HospitalityLocation;
  onChange: (location: HospitalityLocation) => void;
  disabled?: boolean;
};

export function AddressAutocomplete({
  value,
  onChange,
  disabled = false,
}: AddressAutocompleteProps) {
  const listId = useId();
  const [query, setQuery] = useState(value.displayName);
  const [results, setResults] = useState<HospitalityLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(value.displayName);
  }, [value.displayName]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3 || trimmed === value.displayName) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/hospitality/geocode?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("lookup-failed");
        }
        const payload = (await response.json()) as { results?: HospitalityLocation[] };
        setResults(payload.results ?? []);
        setOpen(true);
      } catch (lookupError) {
        if ((lookupError as { name?: string }).name === "AbortError") return;
        setError("Unable to look up addresses right now. You can still enter details below.");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, value.displayName]);

  function patch(partial: Partial<HospitalityLocation>) {
    const next = { ...value, ...partial };
    next.displayName = [next.street, next.suburb, next.city, next.region]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ");
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor={`${listId}-search`} className={labelClass}>
          Venue Address
        </label>
        <input
          id={`${listId}-search`}
          type="search"
          autoComplete="off"
          disabled={disabled}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder="Start typing a street, suburb, or city"
          className={`mt-1 ${inputClass}`}
        />
        {loading ? (
          <p className="mt-1 text-xs text-muted-foreground">Searching New Zealand addresses…</p>
        ) : null}
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
        {open && results.length > 0 ? (
          <ul
            className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-background py-1 shadow-lg"
            role="listbox"
          >
            {results.map((result) => (
              <li key={`${result.displayName}-${result.lat}-${result.lng}`}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-primary/5"
                  onClick={() => {
                    onChange(result);
                    setQuery(result.displayName);
                    setOpen(false);
                  }}
                >
                  {result.displayName}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${listId}-street`} className={labelClass}>
            Street
          </label>
          <input
            id={`${listId}-street`}
            value={value.street}
            disabled={disabled}
            onChange={(event) => patch({ street: event.target.value })}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor={`${listId}-suburb`} className={labelClass}>
            Suburb
          </label>
          <input
            id={`${listId}-suburb`}
            value={value.suburb}
            disabled={disabled}
            onChange={(event) => patch({ suburb: event.target.value })}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor={`${listId}-city`} className={labelClass}>
            City
          </label>
          <input
            id={`${listId}-city`}
            value={value.city}
            disabled={disabled}
            onChange={(event) => patch({ city: event.target.value })}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor={`${listId}-region`} className={labelClass}>
            Region
          </label>
          <select
            id={`${listId}-region`}
            value={value.region}
            disabled={disabled}
            onChange={(event) => patch({ region: event.target.value })}
            className={`mt-1 ${inputClass}`}
          >
            <option value="">Select a region</option>
            {NZ_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
