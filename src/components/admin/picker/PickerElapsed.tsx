"use client";

import { useEffect, useState } from "react";
import { formatElapsedSince } from "@/lib/admin/picker-shared";

export function PickerElapsed({ paidAt }: { paidAt: string }) {
  const [label, setLabel] = useState("—");

  useEffect(() => {
    const tick = () => setLabel(formatElapsedSince(paidAt));
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, [paidAt]);

  return <span>{label}</span>;
}
