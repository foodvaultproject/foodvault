"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExploreLightboxFavoriteButton } from "@/components/explore/ExploreLightboxFavoriteButton";
import { PartnerGalleryImage } from "@/components/partners/PartnerGalleryImage";
import { PartnerLogo } from "@/components/partners/PartnerLogo";
import type { HomeExploreGalleryItem } from "@/lib/member/home-explore-gallery";

type ExploreGalleryLightboxProps = {
  items: HomeExploreGalleryItem[];
  openIndex: number;
  onClose: () => void;
  canFavorite?: boolean;
  favoritedPartnerIds?: string[];
};

export function ExploreGalleryLightbox({
  items,
  openIndex,
  onClose,
  canFavorite = false,
  favoritedPartnerIds = [],
}: ExploreGalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(openIndex);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const indexFromScrollRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);

  const currentItem = items[currentIndex];
  const favoritedSet = useMemo(
    () => new Set(favoritedPartnerIds),
    [favoritedPartnerIds]
  );

  const close = useCallback(() => onClose(), [onClose]);
  const showPrev = useCallback(
    () =>
      setCurrentIndex((index) =>
        items.length === 0 ? index : (index - 1 + items.length) % items.length
      ),
    [items.length]
  );
  const showNext = useCallback(
    () =>
      setCurrentIndex((index) =>
        items.length === 0 ? index : (index + 1) % items.length
      ),
    [items.length]
  );

  const syncIndexFromScroll = useCallback(() => {
    const carousel = mobileCarouselRef.current;
    if (!carousel) return;

    const height = carousel.clientHeight;
    if (!height) return;

    const nextIndex = Math.min(
      items.length - 1,
      Math.max(0, Math.round(carousel.scrollTop / height))
    );

    setCurrentIndex((index) => {
      if (index === nextIndex) return index;
      indexFromScrollRef.current = true;
      return nextIndex;
    });
  }, [items.length]);

  const handleMobileScroll = useCallback(() => {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
    }

    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      syncIndexFromScroll();
    });
  }, [syncIndexFromScroll]);

  useEffect(() => {
    setCurrentIndex(openIndex);
  }, [openIndex]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") showPrev();
      if (event.key === "ArrowRight" || event.key === "ArrowDown") showNext();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close, showPrev, showNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (indexFromScrollRef.current) {
      indexFromScrollRef.current = false;
      return;
    }

    const carousel = mobileCarouselRef.current;
    if (!carousel) return;

    const height = carousel.clientHeight;
    if (!height) return;

    carousel.scrollTo({
      top: currentIndex * height,
      behavior: "auto",
    });
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  if (!currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 md:bg-black/80 md:p-4"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div
        className="relative flex h-[100dvh] w-full max-w-md items-stretch justify-center md:h-auto md:items-center"
        onClick={(event) => event.stopPropagation()}
      >
        {items.length > 1 ? (
          <button
            type="button"
            onClick={showPrev}
            className="absolute -left-2 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 md:-left-14 md:flex"
            aria-label="Previous image"
          >
            &#8249;
          </button>
        ) : null}

        <div className="relative h-full w-full md:h-auto">
          <div
            ref={mobileCarouselRef}
            className="flex h-full w-full snap-y snap-mandatory flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
            onScroll={handleMobileScroll}
            aria-label="Explore gallery"
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex min-h-full w-full shrink-0 snap-center snap-always items-center"
              >
                <PartnerGalleryImage
                  src={item.imageUrl}
                  alt={`${item.businessName} gallery image`}
                  className="w-full !rounded-none"
                  sizes="100vw"
                  priority={Math.abs(index - currentIndex) <= 1}
                />
              </div>
            ))}
          </div>

          <div className="hidden md:block">
            <PartnerGalleryImage
              src={currentItem.imageUrl}
              alt={`${currentItem.businessName} gallery image`}
              className="w-full !rounded-none"
              sizes="100vw"
              priority
            />
          </div>

          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            <div className="pointer-events-auto flex items-start justify-between gap-3 p-3 md:p-4">
              <button
                type="button"
                onClick={close}
                className="flex h-10 w-10 shrink-0 items-center justify-center text-white transition-opacity hover:opacity-80"
                aria-label="Back to explore gallery"
              >
                <ArrowLeft className="h-7 w-7" strokeWidth={2.25} />
              </button>
              <span className="max-w-[58%] truncate rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-white sm:max-w-[62%] sm:text-xs">
                {currentItem.memberOfferLabel}
              </span>
            </div>

            <div className="pointer-events-auto bg-gradient-to-t from-black/80 via-black/45 to-transparent px-4 pb-[calc(0.85rem+env(safe-area-inset-bottom,0px))] pt-12 md:pb-4">
              <div className="flex items-end justify-between gap-4">
                <Link
                  href={`/brands/${currentItem.partnerSlug}`}
                  className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90"
                >
                  <PartnerLogo
                    src={currentItem.logoUrl}
                    originalSrc={currentItem.logoOriginalUrl}
                    alt=""
                    businessName={currentItem.businessName}
                    size="xs"
                    crop={currentItem.logoCrop}
                    className="!h-10 !w-10 shrink-0 bg-white/10"
                  />
                  <p className="truncate text-sm font-semibold text-white sm:text-base">
                    {currentItem.businessName}
                  </p>
                </Link>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <ExploreLightboxFavoriteButton
                    partnerId={currentItem.partnerId}
                    initialFavorited={favoritedSet.has(currentItem.partnerId)}
                    canFavorite={canFavorite}
                  />
                  <Link
                    href={`/brands/${currentItem.partnerSlug}`}
                    className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5"
                  >
                    View offer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {items.length > 1 ? (
          <button
            type="button"
            onClick={showNext}
            className="absolute -right-2 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 md:-right-14 md:flex"
            aria-label="Next image"
          >
            &#8250;
          </button>
        ) : null}
      </div>
    </div>
  );
}
