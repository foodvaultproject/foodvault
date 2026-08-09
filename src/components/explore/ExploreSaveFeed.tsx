"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExploreDepartmentFilterBar } from "@/components/explore/ExploreDepartmentFilterBar";
import { ExploreGalleryLightbox } from "@/components/home/ExploreGalleryLightbox";
import { PartnerGalleryImage } from "@/components/partners/PartnerGalleryImage";
import { brandTileSectionClass } from "@/components/browse-brands/brand-card-layout";
import { buildConsumerSearchHref } from "@/lib/consumer-nav-restructure";
import { HOME_EXPLORE_PAGE_SIZE } from "@/lib/homepage/explore-section";
import type { HomeExploreGalleryItem } from "@/lib/member/home-explore-gallery";

const EXPLORE_FEED_BATCH = HOME_EXPLORE_PAGE_SIZE;

type ExploreSaveFeedProps = {
  items: HomeExploreGalleryItem[];
  canFavorite: boolean;
  favoritedPartnerIds: string[];
};

export function ExploreSaveFeed({
  items,
  canFavorite,
  favoritedPartnerIds,
}: ExploreSaveFeedProps) {
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(EXPLORE_FEED_BATCH);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);

  const filteredItems = useMemo(() => {
    if (!departmentFilter) return items;
    return items.filter((item) => item.department === departmentFilter);
  }, [items, departmentFilter]);

  useEffect(() => {
    setVisibleCount(EXPLORE_FEED_BATCH);
  }, [departmentFilter]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );

  const hasMore = visibleItems.length < filteredItems.length;

  useEffect(() => {
    if (!hasMore) return;

    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + EXPLORE_FEED_BATCH, filteredItems.length)
          );
        }
      },
      { rootMargin: "480px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredItems.length, hasMore, visibleItems.length]);

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;

      if (currentY <= 8) {
        setFiltersVisible(true);
      } else if (delta > 6) {
        setFiltersVisible(false);
      } else if (delta < -6) {
        setFiltersVisible(true);
      }

      lastScrollYRef.current = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleExploreScrollTop() {
      setFiltersVisible(true);
    }

    window.addEventListener("foodvault:explore-scroll-top", handleExploreScrollTop);
    return () =>
      window.removeEventListener("foodvault:explore-scroll-top", handleExploreScrollTop);
  }, []);

  const moreFiltersHref = buildConsumerSearchHref(
    departmentFilter ? { department: departmentFilter } : undefined
  );

  if (items.length === 0) {
    return (
      <div className={brandTileSectionClass}>
        <p className="py-16 text-center text-sm text-muted-foreground">
          Brand gallery images will appear here as partners add photos to their profiles.
        </p>
      </div>
    );
  }

  return (
    <>
      <ExploreDepartmentFilterBar
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        moreFiltersHref={moreFiltersHref}
        visible={filtersVisible}
      />

      {filteredItems.length === 0 ? (
        <div className={`${brandTileSectionClass} py-16 text-center`}>
          <p className="text-sm text-muted-foreground">
            No gallery images match this department yet.
          </p>
          <Link
            href={moreFiltersHref}
            className="mt-3 inline-flex text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Try full search filters →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid w-full grid-cols-3 gap-px md:hidden">
            {visibleItems.map((item, index) => (
              <ExploreGridTile
                key={item.id}
                item={item}
                index={index}
                onOpen={() => setOpenIndex(index)}
              />
            ))}
          </div>

          <div
            className={`${brandTileSectionClass} hidden md:grid md:grid-cols-3 md:gap-[0.3rem] lg:grid-cols-4`}
          >
            {visibleItems.map((item, index) => (
              <ExploreGridTile
                key={item.id}
                item={item}
                index={index}
                onOpen={() => setOpenIndex(index)}
              />
            ))}
          </div>

          {hasMore ? <div ref={loadMoreRef} className="h-12 md:h-16" aria-hidden /> : null}
        </>
      )}

      {openIndex !== null ? (
        <ExploreGalleryLightbox
          items={visibleItems}
          openIndex={openIndex}
          onClose={() => setOpenIndex(null)}
          canFavorite={canFavorite}
          favoritedPartnerIds={favoritedPartnerIds}
        />
      ) : null}
    </>
  );
}

function ExploreGridTile({
  item,
  index,
  onOpen,
}: {
  item: HomeExploreGalleryItem;
  index: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset"
      aria-label={`View ${item.businessName} gallery image`}
    >
      {item.department ? (
        <span className="absolute right-1 top-1 z-10 max-w-[calc(100%-0.5rem)] truncate rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white">
          {item.department}
        </span>
      ) : null}
      <PartnerGalleryImage
        src={item.imageUrl}
        alt=""
        className="!rounded-none"
        imageClassName="transition-transform duration-300 group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 33vw, 25vw"
        priority={index < 12}
      />
    </button>
  );
}
