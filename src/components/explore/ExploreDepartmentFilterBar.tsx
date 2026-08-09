"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PRIMARY_DEPARTMENTS } from "@/data/partner-categories";

type ExploreDepartmentFilterBarProps = {
  departmentFilter: string | null;
  onDepartmentChange: (department: string | null) => void;
  moreFiltersHref: string;
  visible: boolean;
};

export function ExploreDepartmentFilterBar({
  departmentFilter,
  onDepartmentChange,
  moreFiltersHref,
  visible,
}: ExploreDepartmentFilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollHints = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 4);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 4
    );
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollHints();

    container.addEventListener("scroll", updateScrollHints, { passive: true });
    const observer = new ResizeObserver(updateScrollHints);
    observer.observe(container);

    return () => {
      container.removeEventListener("scroll", updateScrollHints);
      observer.disconnect();
    };
  }, [updateScrollHints]);

  function scrollFilters(direction: "left" | "right") {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  }

  return (
    <div
      className={`sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md transition-transform duration-300 md:top-[calc(4.25rem+3.25rem)] ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="relative mx-auto max-w-[1200px]">
        {canScrollLeft ? (
          <button
            type="button"
            onClick={() => scrollFilters("left")}
            className="absolute left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-sm transition-colors hover:bg-surface md:flex"
            aria-label="Scroll filters left"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
          </button>
        ) : null}

        {canScrollRight ? (
          <button
            type="button"
            onClick={() => scrollFilters("right")}
            className="absolute right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-sm transition-colors hover:bg-surface md:flex"
            aria-label="Scroll filters right"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </button>
        ) : null}

        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto px-3 py-2.5 sm:px-6 lg:px-8 md:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            type="button"
            onClick={() => onDepartmentChange(null)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
              departmentFilter === null
                ? "bg-primary text-white"
                : "bg-primary/10 text-primary hover:bg-primary/15"
            }`}
          >
            All
          </button>
          {PRIMARY_DEPARTMENTS.map((department) => (
            <button
              key={department}
              type="button"
              onClick={() => onDepartmentChange(department)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                departmentFilter === department
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary hover:bg-primary/15"
              }`}
            >
              {department}
            </button>
          ))}
          <Link
            href={moreFiltersHref}
            className="ml-1 shrink-0 rounded-full border border-primary/20 bg-background px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 sm:text-sm"
          >
            More filters
          </Link>
        </div>
      </div>
    </div>
  );
}
