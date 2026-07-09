"use client";

import { useCallback, useEffect, useState } from "react";
import { PartnerGalleryImage } from "@/components/partners/PartnerGalleryImage";

type BrandGalleryProps = {
  images: string[];
  businessName: string;
};

export function BrandGallery({ images, businessName }: BrandGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
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
              square
              className="rounded-lg"
              imageClassName="transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
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
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
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
              className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
              aria-label="Previous image"
            >
              &#8249;
            </button>
          ) : null}

          <div
            className="relative mx-auto w-full max-w-md"
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
              className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
              aria-label="Next image"
            >
              &#8250;
            </button>
          ) : null}

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {openIndex + 1} / {images.length}
          </span>
        </div>
      ) : null}
    </>
  );
}
