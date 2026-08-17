"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { browseFilterSelectClass } from "@/components/browse-brands/BrowseMultiSelectFilter";
import { filterSuggestions } from "@/lib/hospitality/localities";

type SuggestFilterInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  disabled?: boolean;
  loadSuggestions?: (query: string) => Promise<string[]>;
};

export function SuggestFilterInput({
  label,
  value,
  onChange,
  options,
  placeholder = "Start typing",
  disabled = false,
  loadSuggestions,
}: SuggestFilterInputProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [remoteOptions, setRemoteOptions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const mergedOptions = useMemo(
    () => [...new Set([...options, ...remoteOptions])],
    [options, remoteOptions]
  );

  const suggestions = useMemo(
    () => filterSuggestions(mergedOptions, query),
    [mergedOptions, query]
  );

  useEffect(() => {
    if (!loadSuggestions || disabled) {
      setRemoteOptions([]);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setRemoteOptions([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void loadSuggestions(trimmed).then((next) => {
        if (!cancelled) setRemoteOptions(next);
      });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [disabled, loadSuggestions, query]);

  const commit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        onChange("");
        setQuery("");
        setOpen(false);
        return;
      }

      const exact = mergedOptions.find(
        (option) => option.toLowerCase() === trimmed.toLowerCase()
      );
      const next = exact ?? suggestions[0] ?? trimmed;
      onChange(next);
      setQuery(next);
      setOpen(false);
    },
    [onChange, mergedOptions, suggestions]
  );

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        commit(query);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, query, commit]);

  return (
    <div ref={containerRef} className="relative block min-w-0 flex-1">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          {label}
        </span>
        <input
          type="search"
          autoComplete="off"
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (!event.target.value.trim()) {
              onChange("");
            }
          }}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(query);
            }
            if (event.key === "Escape") {
              setQuery(value);
              setOpen(false);
            }
          }}
          className={`${browseFilterSelectClass} disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted-foreground`}
        />
      </label>
      {open && !disabled && suggestions.length > 0 ? (
        <ul
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-background py-1 shadow-lg"
          role="listbox"
        >
          {suggestions.map((option) => (
            <li key={option}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-primary/5"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commit(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
