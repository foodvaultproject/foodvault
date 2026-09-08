"use client";

import { useEffect } from "react";

type LostSaleEvent = {
  product_id: string;
  sku?: string | null;
  name?: string | null;
  source: "view" | "search";
  search_query?: string;
  estimated_revenue?: number;
};

export function LostSaleTracker({ events }: { events: LostSaleEvent[] }) {
  useEffect(() => {
    if (events.length === 0) return;
    const key = events
      .map((event) => `${event.source}:${event.product_id}:${event.search_query ?? ""}`)
      .sort()
      .join("|");
    const seen = sessionStorage.getItem("fv.lost-sale");
    if (seen === key) return;
    sessionStorage.setItem("fv.lost-sale", key);

    void Promise.all(
      events.slice(0, 12).map((event) =>
        fetch("/api/pantry/lost-sale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        }).catch(() => undefined)
      )
    );
  }, [events]);

  return null;
}
