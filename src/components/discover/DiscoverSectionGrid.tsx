"use client";

import { Children, useMemo, useState, type ReactNode } from "react";

const DESKTOP_COLUMNS = 4;
const DESKTOP_INITIAL_ROWS = 4;
const DESKTOP_LOAD_MORE_ROWS = 4;

const INITIAL_DESKTOP_COUNT = DESKTOP_COLUMNS * DESKTOP_INITIAL_ROWS;
const LOAD_MORE_COUNT = DESKTOP_COLUMNS * DESKTOP_LOAD_MORE_ROWS;

type DiscoverSectionGridProps = {
  children: ReactNode;
};

export function DiscoverSectionGrid({ children }: DiscoverSectionGridProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_DESKTOP_COUNT);

  if (items.length === 0) return null;

  const desktopItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <>
      <div className="-mx-4 overflow-x-auto px-4 pb-2 lg:hidden">
        <div className="grid w-max auto-cols-[minmax(9.75rem,42vw)] grid-flow-col grid-rows-2 gap-x-4 gap-y-4">
          {items}
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="grid grid-cols-4 gap-6">{desktopItems}</div>
        {hasMore ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
              className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-8 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5"
            >
              Load more
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
