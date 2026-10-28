"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { clearReturnScroll, normalizeReturnHref, readReturnScroll } from "@/lib/commerce/return-scroll";

export function ReturnScrollRestore() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    const saved = readReturnScroll();
    if (!saved) return;
    const here = normalizeReturnHref(search ? `${pathname}?${search}` : pathname);
    if (saved.href !== here) return;

    const y = saved.y;
    let attempts = 0;
    let timer = 0;
    let cancelled = false;
    const apply = () => {
      if (cancelled) return;
      window.scrollTo(0, y);
      attempts += 1;
      const settled = Math.abs(window.scrollY - y) <= 2 || attempts >= 12;
      if (!settled) {
        timer = window.setTimeout(apply, attempts < 4 ? 0 : 50);
        return;
      }
      timer = window.setTimeout(() => {
        if (!cancelled) clearReturnScroll();
      }, 0);
    };
    apply();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname, search]);

  return null;
}
