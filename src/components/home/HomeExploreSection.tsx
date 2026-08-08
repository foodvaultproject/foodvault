"use client";

import { useMemo, useState } from "react";
import { ExploreGalleryLightbox } from "@/components/home/ExploreGalleryLightbox";
import { PartnerGalleryImage } from "@/components/partners/PartnerGalleryImage";
import { brandTileSectionClass } from "@/components/browse-brands/brand-card-layout";
import {
  SECTION_PY_HOME_PARTNER,
  SECTION_PY_HOME_REFINE,
} from "@/components/home/section-spacing";
import { HOME_EXPLORE_PAGE_SIZE } from "@/lib/homepage/explore-section";
import type { HomeExploreGalleryItem } from "@/lib/member/home-explore-gallery";

type HomeExploreSectionProps = {
  items: HomeExploreGalleryItem[];
  compactSpacing?: boolean;
};

export function HomeExploreSection({
  items,
  compactSpacing = false,
}: HomeExploreSectionProps) {
  const [visibleCount, setVisibleCount] = useState(HOME_EXPLORE_PAGE_SIZE);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  if (items.length === 0) return null;

  const hasMore = items.length > visibleCount;

  return (
    <section
      className={`bg-background ${
        compactSpacing ? SECTION_PY_HOME_PARTNER : SECTION_PY_HOME_REFINE
      }`}
    >
      <div className={brandTileSectionClass}>
        <div className="mb-3 flex items-center gap-2 sm:mb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </span>
          <h2 className="text-base font-bold text-foreground sm:text-lg">Explore & Save</h2>
        </div>

        <div className="grid grid-cols-3 gap-[0.3rem] md:grid-cols-4">
          {visibleItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              aria-label={`View ${item.businessName} gallery image`}
            >
              {item.department ? (
                <span className="absolute right-1 top-1 z-10 max-w-[calc(100%-0.5rem)] truncate rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white sm:text-[11px]">
                  {item.department}
                </span>
              ) : null}
              <PartnerGalleryImage
                src={item.imageUrl}
                alt=""
                className="!rounded-none"
                imageClassName="transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 33vw, 25vw"
                priority={index < 8}
              />
            </button>
          ))}
        </div>

        {hasMore ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((count) => count + HOME_EXPLORE_PAGE_SIZE)
              }
              className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-8 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5"
            >
              Load more
            </button>
          </div>
        ) : null}
      </div>

      {openIndex !== null ? (
        <ExploreGalleryLightbox
          items={visibleItems}
          openIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </section>
  );
}
