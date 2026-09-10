"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SafeImage } from "@/components/media/SafeImage";

type PantryProductGalleryProps = {
  images: string[];
  alt: string;
  badge?: string | null;
};

export function PantryProductGallery({ images, alt, badge }: PantryProductGalleryProps) {
  const urls = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const current = urls[Math.min(active, Math.max(urls.length - 1, 0))] ?? "";

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, urls.length]);

  function go(delta: number) {
    if (urls.length < 2) return;
    setActive((index) => (index + delta + urls.length) % urls.length);
  }

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!finePointer) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = event.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < 40) return;
    go(delta < 0 ? 1 : -1);
  }

  return (
    <div className="flex gap-3">
      {urls.length > 1 ? (
        <div className="hidden max-h-[32rem] w-20 shrink-0 flex-col gap-2 overflow-y-auto md:flex">
          {urls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
              className={`relative aspect-square w-full overflow-hidden rounded-md border bg-surface ${
                index === active
                  ? "border-vm-primary ring-2 ring-[#10B981]"
                  : "border-border hover:border-vm-primary/30"
              }`}
            >
              <SafeImage
                src={url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                fallbackVariant="muted"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div
          className={`relative aspect-square overflow-hidden rounded-xl border border-border bg-surface ${
            finePointer ? "cursor-zoom-in" : "cursor-pointer"
          }`}
          onMouseEnter={() => finePointer && setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={handleMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (!finePointer && current) setLightbox(true);
          }}
          role={finePointer ? undefined : "button"}
          aria-label={finePointer ? undefined : `Enlarge ${alt}`}
          tabIndex={finePointer ? undefined : 0}
          onKeyDown={(event) => {
            if (!finePointer && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              if (current) setLightbox(true);
            }
          }}
        >
          {current ? (
            <SafeImage
              src={current}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`object-cover transition-transform duration-200 ease-out ${
                finePointer && zooming ? "scale-[2.2]" : "scale-100"
              }`}
              style={{
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
              fallbackVariant="muted"
            />
          ) : (
            <SafeImage
              src=""
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              fallbackVariant="muted"
            />
          )}
          {badge ? (
            <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-sm bg-background/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground shadow-sm">
              {badge}
            </span>
          ) : null}
        </div>

        {urls.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5 md:hidden">
            {urls.map((url, index) => (
              <button
                key={`${url}-dot-${index}`}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                onClick={() => setActive(index)}
                className={`h-2 w-2 rounded-full ${
                  index === active ? "bg-[#10B981]" : "bg-border"
                }`}
              />
            ))}
          </div>
        ) : null}
        {!finePointer && current ? (
          <p className="mt-2 text-center text-xs text-muted md:hidden">Tap image to enlarge</p>
        ) : null}
      </div>

      {lightbox && current ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} image`}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            aria-label="Close image"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[90vh] w-full max-w-3xl"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current} alt={alt} className="mx-auto max-h-[90vh] w-auto max-w-full object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
