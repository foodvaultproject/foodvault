"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function StockUpBackButton() {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-0.5 text-sm font-semibold text-vm-primary transition-colors hover:text-[#047857]"
    >
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      Back
    </button>
  );
}
