"use client";

import { useEffect, useState } from "react";
import {
  formatVaultDropCountdown,
  getVaultDropCountdownParts,
} from "@/lib/vault-drop";

export function VaultDropCountdown({
  endTimeIso,
  onExpired,
  className = "",
}: {
  endTimeIso: string | null;
  onExpired?: () => void;
  className?: string;
}) {
  const [parts, setParts] = useState(() => getVaultDropCountdownParts(endTimeIso));

  useEffect(() => {
    setParts(getVaultDropCountdownParts(endTimeIso));
    const interval = window.setInterval(() => {
      setParts(getVaultDropCountdownParts(endTimeIso));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [endTimeIso]);

  useEffect(() => {
    if (parts.expired) {
      onExpired?.();
    }
  }, [parts.expired, onExpired]);

  return (
    <p
      className={`font-mono text-xs font-semibold tracking-wide sm:text-sm ${className}`.trim()}
      aria-live="polite"
    >
      {formatVaultDropCountdown(parts)}
    </p>
  );
}
