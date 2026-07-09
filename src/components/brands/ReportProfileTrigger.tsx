"use client";

import { useState } from "react";
import { ReportBrandModal } from "@/components/brands/ReportBrandModal";

type ReportProfileTriggerProps = {
  brandId: string;
  brandName: string;
  isLoggedIn: boolean;
  canSubmit: boolean;
};

export function ReportProfileTrigger({
  brandId,
  brandName,
  isLoggedIn,
  canSubmit,
}: ReportProfileTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-6 pt-2 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4h3v12H4V4zm13 0h3v8h-3V4zM4 20h16v2H4v-2z"
            />
          </svg>
          Report Profile
        </button>
      </div>

      <ReportBrandModal
        open={open}
        onClose={() => setOpen(false)}
        brandId={brandId}
        brandName={brandName}
        isLoggedIn={isLoggedIn}
        canSubmit={canSubmit}
      />
    </>
  );
}
