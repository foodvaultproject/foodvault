"use client";

import type { DiscoveryMode } from "@/lib/hospitality/types";

type DiscoveryModeToggleProps = {
  value: DiscoveryMode;
  onChange: (mode: DiscoveryMode) => void;
};

const options: { value: DiscoveryMode; label: string }[] = [
  { value: "online", label: "Shop Online" },
  { value: "local", label: "Visit Local" },
];

export function DiscoveryModeToggle({ value, onChange }: DiscoveryModeToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Discovery mode"
      className="inline-flex w-full rounded-md border border-border bg-background p-1 shadow-sm sm:w-auto"
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-sm px-4 py-2 text-sm font-semibold transition-colors sm:flex-none ${
              selected
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
