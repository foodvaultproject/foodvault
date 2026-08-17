"use client";

import { useEffect, useRef, useState } from "react";

export const browseFilterSelectClass =
  "w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export type BrowseFilterOptionGroup = {
  label: string;
  options: readonly string[];
};

type BrowseMultiSelectFilterProps = {
  label: string;
  placeholder: string;
  options: readonly string[];
  optionGroups?: readonly BrowseFilterOptionGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
};

export function BrowseMultiSelectFilter({
  label,
  placeholder,
  options,
  optionGroups,
  selected,
  onChange,
  disabled = false,
}: BrowseMultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function toggleOption(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  }

  const triggerLabel =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`;

  const groupedOptions =
    optionGroups && optionGroups.length > 0
      ? optionGroups
      : options.length > 0
        ? [{ label: "", options }]
        : [];

  return (
    <div
      ref={containerRef}
      className={`relative block min-w-0 flex-1 ${open ? "z-50" : "z-10"}`}
    >
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`${browseFilterSelectClass} flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className="truncate">{triggerLabel}</span>
        <span className="shrink-0 text-muted-foreground" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-[60] mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-background py-1 shadow-lg"
        >
          {groupedOptions.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No options available
            </p>
          ) : (
            groupedOptions.map((group) => (
              <div key={group.label || "options"}>
                {group.label ? (
                  <p className="sticky top-0 bg-background px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </p>
                ) : null}
                {group.options.map((option) => {
                  const isSelected = selected.includes(option);
                  return (
                    <label
                      key={`${group.label}-${option}`}
                      className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-primary/5"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOption(option)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
