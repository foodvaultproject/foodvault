"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PartnerGalleryImage } from "@/components/partners/PartnerGalleryImage";
import type { HomeExploreGalleryItem } from "@/lib/member/home-explore-gallery";

type ExploreGalleryLightboxProps = {
  items: HomeExploreGalleryItem[];
  openIndex: number;
  onClose: () => void;
};

export function ExploreGalleryLightbox({
  items,
  openIndex,
  onClose,
}: ExploreGalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(openIndex);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const indexFromScrollRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);

  const currentItem = items[currentIndex];

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

    const width = carousel.clientWidth;
    if (!width) return;

    const nextIndex = Math.min(
      items.length - 1,
      Math.max(0, Math.round(carousel.scrollLeft / width))
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
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
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

    const width = carousel.clientWidth;
    if (!width) return;

    carousel.scrollTo({
      left: currentIndex * width,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <button
        type="button"
        onClick={close}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
        aria-label="Close gallery"
      >
        &times;
      </button>

      {items.length > 1 ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            showPrev();
          }}
          className="absolute left-4 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 md:flex"
          aria-label="Previous image"
        >
          &#8249;
        </button>
      ) : null}

      <div
        ref={mobileCarouselRef}
        className="relative mx-auto flex h-full w-full max-w-md touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
        onClick={(event) => event.stopPropagation()}
        onScroll={handleMobileScroll}
        aria-label="Explore gallery"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex h-full min-w-full snap-center items-center justify-center px-1"
          >
            <PartnerGalleryImage
              src={item.imageUrl}
              alt={`${item.businessName} gallery image`}
              className="!rounded-none"
              sizes="100vw"
              priority={Math.abs(index - currentIndex) <= 1}
            />
          </div>
        ))}
      </div>

      <div
        className="relative mx-auto hidden w-full max-w-md md:block"
        onClick={(event) => event.stopPropagation()}
      >
        <PartnerGalleryImage
          src={currentItem.imageUrl}
          alt={`${currentItem.businessName} gallery image`}
          className="!rounded-none"
          sizes="100vw"
          priority
        />
      </div>

      {items.length > 1 ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            showNext();
          }}
          className="absolute right-4 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 md:flex"
          aria-label="Next image"
        >
          &#8250;
        </button>
      ) : null}

      <div
        className="absolute bottom-16 left-1/2 z-10 flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white">
          {currentItem.businessName}
        </span>
        <Link
          href={`/brands/${currentItem.partnerSlug}`}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5"
        >
          View Savings
        </Link>
      </div>

      <span className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
        {currentIndex + 1} / {items.length}
      </span>
    </div>
  );
}
