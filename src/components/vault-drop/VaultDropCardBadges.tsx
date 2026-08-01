export function VaultDropTitleBadge({ label }: { label: string }) {
  return (
    <span className="inline-block -skew-x-12 bg-primary px-2.5 py-1 shadow-sm sm:px-3 sm:py-1.5">
      <span className="inline-block skew-x-12 text-[0.625rem] font-bold uppercase leading-none tracking-wide text-primary-foreground sm:text-xs">
        {label}
      </span>
    </span>
  );
}

export function VaultDropDiscountBadge({ label }: { label: string }) {
  return (
    <span className="inline-block -skew-x-12 bg-amber-500 px-3 py-1.5 shadow-sm sm:px-3.5 sm:py-2">
      <span className="inline-block skew-x-12 text-sm font-bold italic leading-none text-white sm:text-base">
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
