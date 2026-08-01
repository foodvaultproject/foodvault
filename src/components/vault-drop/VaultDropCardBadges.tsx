"use client";

import { useEffect, useState } from "react";
import { VaultDropCountdown } from "@/components/home/VaultDropCountdown";
import { getVaultDropCountdownParts } from "@/lib/vault-drop";

export function VaultDropCountdownBadge({
  endTimeIso,
  onExpired,
}: {
  endTimeIso: string | null;
  onExpired?: () => void;
}) {
  const [expired, setExpired] = useState(() =>
    getVaultDropCountdownParts(endTimeIso).expired
  );

  useEffect(() => {
    setExpired(getVaultDropCountdownParts(endTimeIso).expired);
  }, [endTimeIso]);

  function handleExpired() {
    setExpired(true);
    onExpired?.();
  }

  return (
    <span className="inline-block -skew-x-12 bg-red-600 px-2.5 py-1 shadow-sm sm:px-3 sm:py-1.5">
      <span className="inline-block skew-x-12">
        {expired || !endTimeIso ? (
          <span className="text-[0.625rem] font-bold uppercase leading-none tracking-wide text-white sm:text-xs">
            Expired
          </span>
        ) : (
          <VaultDropCountdown
            endTimeIso={endTimeIso}
            onExpired={handleExpired}
            className="text-[0.625rem] font-semibold leading-none text-white sm:text-xs"
          />
        )}
      </span>
    </span>
  );
}

export function VaultDropDiscountBadge({ label }: { label: string }) {
  return (
    <span className="inline-block -skew-x-12 bg-amber-500 px-2.5 py-1 shadow-sm sm:px-3 sm:py-1.5">
      <span className="inline-block skew-x-12 text-[1.1375rem] font-extrabold italic leading-none text-white sm:text-[1.3rem]">
        {label}
      </span>
    </span>
  );
}

export function VaultDropReasonTag({ label }: { label: string }) {
  return (
    <span className="mb-2 inline-flex w-fit rounded-full bg-red-400 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-white">
      {label}
    </span>
  );
}
