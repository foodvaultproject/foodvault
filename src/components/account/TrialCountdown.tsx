"use client";

import { useEffect, useState } from "react";
import {
  formatTrialCountdownLabel,
  getTrialCountdownParts,
  type TrialCountdownParts,
} from "@/lib/member/trial-countdown";

type TrialCountdownProps = {
  trialEndsAt: string | null;
  size?: "lg" | "md";
  className?: string;
};

function CountdownUnit({
  value,
  label,
  size,
}: {
  value: number;
  label: string;
  size: "lg" | "md";
}) {
  const valueClass =
    size === "lg"
      ? "text-3xl font-bold tabular-nums sm:text-4xl"
      : "text-2xl font-bold tabular-nums";

  return (
    <div className="flex min-w-[5rem] flex-1 flex-col items-center rounded-lg border border-border bg-background/90 px-3 py-3 shadow-sm sm:min-w-[5.5rem] sm:px-4">
      <span className={`${valueClass} text-foreground`}>
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function TrialCountdown({
  trialEndsAt,
  size = "lg",
  className = "",
}: TrialCountdownProps) {
  const [parts, setParts] = useState<TrialCountdownParts>(() =>
    getTrialCountdownParts(trialEndsAt)
  );

  useEffect(() => {
    setParts(getTrialCountdownParts(trialEndsAt));

    const intervalId = window.setInterval(() => {
      setParts(getTrialCountdownParts(trialEndsAt));
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [trialEndsAt]);

  if (parts.expired) {
    return (
      <p className="mt-5 text-2xl font-bold text-foreground sm:text-3xl">
        Trial ended
      </p>
    );
  }

  return (
    <div
      className={`mt-5 ${className}`.trim()}
      role="timer"
      aria-live="polite"
      aria-label={formatTrialCountdownLabel(parts)}
    >
      <div className="flex max-w-md gap-2 sm:gap-3">
        <CountdownUnit
          value={parts.days}
          label={parts.days === 1 ? "Day" : "Days"}
          size={size}
        />
        <CountdownUnit value={parts.hours} label="Hours" size={size} />
        <CountdownUnit value={parts.minutes} label="Minutes" size={size} />
      </div>
      <p className="sr-only">{formatTrialCountdownLabel(parts)}</p>
    </div>
  );
}
