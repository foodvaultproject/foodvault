"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExploreDepartmentFilterBar } from "@/components/explore/ExploreDepartmentFilterBar";
import { ExploreGalleryLightbox } from "@/components/home/ExploreGalleryLightbox";
import { DiscoveryModeToggle } from "@/components/hospitality/DiscoveryModeToggle";
import { PartnerGalleryImage } from "@/components/partners/PartnerGalleryImage";
import { brandTileSectionClass } from "@/components/browse-brands/brand-card-layout";
import { PRIMARY_DEPARTMENTS } from "@/data/partner-categories";
import { HOSPITALITY_VENUE_TYPE_LABELS } from "@/lib/hospitality/constants";
import { HOSPITALITY_VENUE_TYPES, type DiscoveryMode } from "@/lib/hospitality/types";
import { buildConsumerSearchHref, consumerSearchPath } from "@/lib/consumer-nav-restructure";
import { HOME_EXPLORE_PAGE_SIZE } from "@/lib/homepage/explore-section";
import type { HomeExploreGalleryItem } from "@/lib/member/home-explore-gallery";

const EXPLORE_FEED_BATCH = HOME_EXPLORE_PAGE_SIZE;
const LOCAL_VENUE_FILTERS = HOSPITALITY_VENUE_TYPES.map(
  (type) => HOSPITALITY_VENUE_TYPE_LABELS[type]
);

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>(
    searchParams.get("mode") === "local" ? "local" : "online"
  );
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(EXPLORE_FEED_BATCH);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    setDiscoveryMode(searchParams.get("mode") === "local" ? "local" : "online");
  }, [searchParams]);

  const modeItems = useMemo(
    () =>
      items.filter((item) =>
        discoveryMode === "local"
          ? item.listingModel === "hospitality_venue"
          : item.listingModel !== "hospitality_venue"
      ),
    [items, discoveryMode]
  );

  const filteredItems = useMemo(() => {
    if (!departmentFilter) return modeItems;
    return modeItems.filter((item) => item.department === departmentFilter);
  }, [modeItems, departmentFilter]);

  useEffect(() => {
    setVisibleCount(EXPLORE_FEED_BATCH);
    setDepartmentFilter(null);
  }, [discoveryMode]);

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

  const moreFiltersHref =
    discoveryMode === "local"
      ? `${consumerSearchPath()}?mode=local`
      : buildConsumerSearchHref(
          departmentFilter ? { department: departmentFilter } : undefined
        );

  function handleDiscoveryModeChange(mode: DiscoveryMode) {
    setDiscoveryMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "local") params.set("mode", "local");
    else params.delete("mode");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const emptyCopy =
    discoveryMode === "local"
      ? "Venue gallery images will appear here as hospitality partners add photos to their profiles."
      : "Brand gallery images will appear here as partners add photos to their profiles.";

  if (modeItems.length === 0 && !departmentFilter) {
    return (
      <>
        <ExploreDepartmentFilterBar
          departmentFilter={departmentFilter}
          onDepartmentChange={setDepartmentFilter}
          moreFiltersHref={moreFiltersHref}
          visible={filtersVisible}
          options={discoveryMode === "local" ? LOCAL_VENUE_FILTERS : PRIMARY_DEPARTMENTS}
          allLabel={discoveryMode === "local" ? "All venues" : "All"}
          leading={
            <DiscoveryModeToggle
              value={discoveryMode}
              onChange={handleDiscoveryModeChange}
            />
          }
        />
        <div className={brandTileSectionClass}>
          <p className="py-16 text-center text-sm text-muted-foreground">{emptyCopy}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ExploreDepartmentFilterBar
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        moreFiltersHref={moreFiltersHref}
        visible={filtersVisible}
        options={discoveryMode === "local" ? LOCAL_VENUE_FILTERS : PRIMARY_DEPARTMENTS}
        allLabel={discoveryMode === "local" ? "All venues" : "All"}
        leading={
          <DiscoveryModeToggle
            value={discoveryMode}
            onChange={handleDiscoveryModeChange}
          />
        }
      />

      {filteredItems.length === 0 ? (
        <div className={`${brandTileSectionClass} py-16 text-center`}>
          <p className="text-sm text-muted-foreground">
            {discoveryMode === "local"
              ? "No hospitality gallery images match this filter yet."
              : "No gallery images match this department yet."}
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
