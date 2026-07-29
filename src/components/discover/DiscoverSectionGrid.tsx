"use client";

import { Children, isValidElement, useMemo, useState, type ReactNode } from "react";
import { brandTileGridGapClass } from "@/components/browse-brands/brand-card-layout";

const DESKTOP_COLUMNS = 4;
const DESKTOP_INITIAL_ROWS = 1;
const DESKTOP_LOAD_MORE_ROWS = 1;

const INITIAL_DESKTOP_COUNT = DESKTOP_COLUMNS * DESKTOP_INITIAL_ROWS;
const LOAD_MORE_COUNT = DESKTOP_COLUMNS * DESKTOP_LOAD_MORE_ROWS;

const MOBILE_TILE_WIDTH_CLASS = "w-[calc((100vw-3rem)/2)] shrink-0";

export type DiscoverMobileLayout =
  | "two-row-scroll"
  | "single-row-scroll"
  | "single-row-infinite";

type DiscoverSectionGridProps = {
  children: ReactNode;
  mobileLayout?: DiscoverMobileLayout;
  equalHeight?: boolean;
};

function getItemKey(item: ReactNode, index: number): string | number {
  if (isValidElement(item) && item.key != null) {
    return item.key;
  }
  return index;
}

function wrapMobileItem(
  item: ReactNode,
  key: string | number | undefined,
  equalHeight: boolean
) {
  return (
    <div
      key={key}
      className={`${MOBILE_TILE_WIDTH_CLASS} snap-start ${equalHeight ? "flex" : ""}`}
    >
      {item}
    </div>
  );
}

function MobileTwoRowScroll({
  items,
  equalHeight,
}: {
  items: ReactNode[];
  equalHeight: boolean;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div
        className={`grid w-max auto-cols-[calc((100vw-3rem)/2)] grid-flow-col grid-rows-2 gap-[5px] ${equalHeight ? "items-stretch" : ""}`}
      >
        {items.map((item, index) =>
          wrapMobileItem(item, getItemKey(item, index), equalHeight)
        )}
      </div>
    </div>
  );
}

function MobileSingleRowScroll({
  items,
  equalHeight,
}: {
  items: ReactNode[];
  equalHeight: boolean;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className={`flex w-max gap-[5px] ${equalHeight ? "items-stretch" : ""}`}>
        {items.map((item, index) =>
          wrapMobileItem(item, getItemKey(item, index), equalHeight)
        )}
      </div>
    </div>
  );
}

function MobileInfiniteRow({
  items,
  equalHeight,
}: {
  items: ReactNode[];
  equalHeight: boolean;
}) {
  const loopItems = useMemo(() => [...items, ...items], [items]);

  return (
    <div className="foodvault-marquee relative overflow-hidden lg:hidden">
      <div
        className={`foodvault-marquee-track flex items-stretch gap-[5px] px-4 ${equalHeight ? "" : ""}`}
      >
        {loopItems.map((item, index) =>
          wrapMobileItem(item, index, equalHeight)
        )}
      </div>
    </div>
  );
}

export function DiscoverSectionGrid({
  children,
  mobileLayout = "two-row-scroll",
  equalHeight = false,
}: DiscoverSectionGridProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_DESKTOP_COUNT);

  if (items.length === 0) return null;

  const desktopItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <>
      {mobileLayout === "single-row-infinite" ? (
        <MobileInfiniteRow items={items} equalHeight={equalHeight} />
      ) : mobileLayout === "single-row-scroll" ? (
        <MobileSingleRowScroll items={items} equalHeight={equalHeight} />
      ) : (
        <MobileTwoRowScroll items={items} equalHeight={equalHeight} />
      )}

      <div className="hidden lg:block">
        <div className={`${brandTileGridGapClass} grid-cols-4`}>{desktopItems}</div>
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
