"use client";

import { useEffect, useId, useState } from "react";
import { normalizeNzRegion } from "@/lib/hospitality/constants";
import type { HospitalityLocation } from "@/lib/hospitality/types";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "text-sm font-bold text-foreground";

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  region?: string;
};

export type NominatimSearchHit = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: NominatimAddress;
};

export type AddressSuggestion = HospitalityLocation & {
  formattedAddress: string;
  label: string;
};

type AddressAutocompleteProps = {
  value?: string;
  onSelectAddress: (formattedAddress: string, details?: HospitalityLocation) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

function formatNominatimAddress(hit: NominatimSearchHit) {
  const address = hit.address ?? {};
  const road = [address.house_number, address.road ?? address.pedestrian]
    .filter(Boolean)
    .join(" ");
  const suburb = address.suburb ?? address.neighbourhood ?? address.city_district ?? "";
  const city = address.city ?? address.town ?? address.village ?? "";
  const constructed = [road, suburb, city].filter(Boolean).join(", ");
  return constructed || hit.display_name?.trim() || "";
}

function toHospitalityLocation(hit: NominatimSearchHit): HospitalityLocation {
  const address = hit.address ?? {};
  const street = [address.house_number, address.road ?? address.pedestrian]
    .filter(Boolean)
    .join(" ");
  const suburb =
    address.suburb ?? address.neighbourhood ?? address.city_district ?? "";
  const city = address.city ?? address.town ?? address.village ?? "";
  const formattedAddress = formatNominatimAddress(hit);

  return {
    street,
    suburb,
    city,
    region: normalizeNzRegion(address.state ?? address.region ?? ""),
    lat: hit.lat ? Number(hit.lat) : null,
    lng: hit.lon ? Number(hit.lon) : null,
    displayName: formattedAddress,
  };
}

export function AddressAutocomplete({
  value = "",
  onSelectAddress,
  disabled = false,
  label = "Venue Address",
  placeholder = "Start typing a street, suburb, or city",
  required = false,
}: AddressAutocompleteProps) {
  const listId = useId();
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const searchTerm = query.trim();
    if (searchTerm.length < 3 || searchTerm === value.trim()) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
      nominatimUrl.searchParams.set("format", "json");
      nominatimUrl.searchParams.set("q", searchTerm);
      nominatimUrl.searchParams.set("countrycodes", "nz");
      nominatimUrl.searchParams.set("addressdetails", "1");
      nominatimUrl.searchParams.set("limit", "5");

      try {
        // Nominatim requires a User-Agent and blocks browser CORS, so the
        // route handler performs the request with User-Agent: "FoodVault-App".
        const response = await fetch(
          `/api/hospitality/geocode?${nominatimUrl.searchParams.toString()}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("lookup-failed");
        }

        const payload = (await response.json()) as {
          hits?: NominatimSearchHit[];
          results?: HospitalityLocation[];
        };

        const hits = payload.hits ?? [];
        const nextSuggestions: AddressSuggestion[] =
          hits.length > 0
            ? hits.slice(0, 5).map((hit) => {
                const location = toHospitalityLocation(hit);
                return {
                  ...location,
                  formattedAddress: location.displayName,
                  label: hit.display_name?.trim() || location.displayName,
                };
              })
            : (payload.results ?? []).slice(0, 5).map((location) => ({
                ...location,
                formattedAddress: location.displayName,
                label: location.displayName,
              }));

        setSuggestions(nextSuggestions);
        setOpen(nextSuggestions.length > 0);
      } catch (lookupError) {
        if ((lookupError as { name?: string }).name === "AbortError") return;
        setError("Unable to look up addresses right now. You can still enter an address below.");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, value]);

  return (
    <div className="relative">
      <label htmlFor={listId} className={labelClass}>
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      <input
        id={listId}
        type="search"
        autoComplete="off"
        required={required}
        disabled={disabled}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        className={`mt-1 ${inputClass}`}
      />
      {loading ? (
        <p className="mt-1 text-xs text-muted-foreground">Searching New Zealand addresses…</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      {open && suggestions.length > 0 ? (
        <ul
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-background py-1 shadow-lg"
          role="listbox"
        >
          {suggestions.map((suggestion) => (
            <li key={`${suggestion.formattedAddress}-${suggestion.lat}-${suggestion.lng}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-primary/5"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelectAddress(suggestion.formattedAddress, suggestion);
                  setQuery(suggestion.formattedAddress);
                  setOpen(false);
                }}
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
