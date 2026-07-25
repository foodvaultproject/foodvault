"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PartnerGalleryImage } from "@/components/partners/PartnerGalleryImage";

type BrandGalleryProps = {
  images: string[];
  businessName: string;
};

export function BrandGallery({ images, businessName }: BrandGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const indexFromScrollRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(
    () =>
      setOpenIndex((current) =>
        current === null ? null : (current - 1 + images.length) % images.length
      ),
    [images.length]
  );
  const showNext = useCallback(
    () =>
      setOpenIndex((current) =>
        current === null ? null : (current + 1) % images.length
      ),
    [images.length]
  );

  const syncIndexFromScroll = useCallback(() => {
    const carousel = mobileCarouselRef.current;
    if (!carousel) return;

    const width = carousel.clientWidth;
    if (!width) return;

    const nextIndex = Math.min(
      images.length - 1,
      Math.max(0, Math.round(carousel.scrollLeft / width))
    );

    setOpenIndex((current) => {
      if (current === nextIndex) return current;
      indexFromScrollRef.current = true;
      return nextIndex;
    });
  }, [images.length]);

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
    if (openIndex === null) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openIndex, close, showPrev, showNext]);

  useEffect(() => {
    if (openIndex === null) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null || indexFromScrollRef.current) {
      indexFromScrollRef.current = false;
      return;
    }

    const carousel = mobileCarouselRef.current;
    if (!carousel) return;

    const width = carousel.clientWidth;
    if (!width) return;

    carousel.scrollTo({
      left: openIndex * width,
      behavior: "auto",
    });
  }, [openIndex]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group overflow-hidden rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            aria-label={`View ${businessName} gallery image ${index + 1}`}
          >
            <PartnerGalleryImage
              src={src}
              alt=""
              className="rounded-lg"
              imageClassName="transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 33vw, 25vw"
            />
          </button>
        ))}
      </div>

      {openIndex !== null ? (
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

          {images.length > 1 ? (
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
            aria-label={`${businessName} gallery`}
          >
            {images.map((src, index) => (
              <div
                key={`${src}-${index}-lightbox-mobile`}
                className="flex h-full min-w-full snap-center items-center justify-center px-1"
              >
                <PartnerGalleryImage
                  src={src}
                  alt={`${businessName} gallery image ${index + 1}`}
                  sizes="100vw"
                  priority={Math.abs(index - openIndex) <= 1}
                />
              </div>
            ))}
          </div>

          <div
            className="relative mx-auto hidden w-full max-w-md md:block"
            onClick={(event) => event.stopPropagation()}
          >
            <PartnerGalleryImage
              src={images[openIndex]}
              alt={`${businessName} gallery image ${openIndex + 1}`}
              sizes="100vw"
              priority
            />
          </div>

          {images.length > 1 ? (
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

          <span className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {openIndex + 1} / {images.length}
          </span>
        </div>
      ) : null}
    </>
  );
}
