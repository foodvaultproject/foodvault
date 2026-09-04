"use client";

import { SafeImage } from "@/components/media/SafeImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DiscountCodeBlock } from "@/components/brands/DiscountCodeBlock";
import type { HomeVaultDrop } from "@/lib/vault-drop-data";
import {
  formatVaultDropDiscountLabel,
  formatVaultDropPrice,
} from "@/lib/vault-drop";
import {
  VaultDropCountdownBadge,
  VaultDropDiscountBadge,
  VaultDropReasonTag,
} from "@/components/vault-drop/VaultDropCardBadges";

function VaultDropImageCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = images.length > 0 ? images : [""];

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [slides.length]);

  const src = slides[activeIndex];

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        No image
      </div>
    );
  }

  return (
    <>
      <SafeImage
        src={src}
        alt=""
        fill
        sizes="(max-width: 640px) 80vw, 19rem"
        className="object-cover transition-opacity duration-500"
        fallbackVariant="muted"
      />
      {slides.length > 1 ? (
        <div className="absolute bottom-2 right-2 z-10 flex gap-1">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-1.5 rounded-full ${
                index === activeIndex ? "bg-white" : "bg-white/45"
              }`}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

function VaultDropCard({ drop }: { drop: HomeVaultDrop }) {
  const [expired, setExpired] = useState(false);

  return (
    <article
      className={`relative flex w-[17.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-opacity sm:w-[19rem] ${
        expired ? "opacity-60 grayscale" : ""
      }`}
    >
      <div className="relative aspect-[4/3] bg-muted">
        <VaultDropImageCarousel images={drop.image_urls} />
        <div className="absolute left-2 top-2 z-10 flex w-fit flex-col items-start gap-1.5">
          <VaultDropCountdownBadge
            endTimeIso={drop.countdown_end_time}
            onExpired={() => setExpired(true)}
          />
          <VaultDropDiscountBadge
            label={formatVaultDropDiscountLabel(drop.discount_percentage)}
          />
        </div>
        {expired ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45">
            <span className="rounded-sm bg-neutral-700 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
              Expired
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <VaultDropReasonTag label={drop.reason_tag} />
        <h3 className="line-clamp-2 text-sm font-bold text-foreground sm:text-base">
          {drop.title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{drop.brandName}</p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground line-through">
            {formatVaultDropPrice(drop.original_price)}
          </span>
          <span className="text-lg font-bold text-primary">
            {formatVaultDropPrice(drop.clearance_price)}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 border-t border-border/80 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            FLASH SALE Code
          </p>
          <DiscountCodeBlock
            code={drop.flashSaleCode}
            state={drop.codeState}
            variant="card"
          />
        </div>

        {expired ? (
          <span className="fv-btn-secondary mt-4 inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold opacity-70">
            Offer Ended
          </span>
        ) : (
          <Link
            href={drop.direct_store_link}
            target="_blank"
            rel="noopener noreferrer"
            className="fv-btn-primary mt-4 inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Shop FLASH SALE
          </Link>
        )}
      </div>
    </article>
  );
}

export function HomeVaultDropSection({ drops }: { drops: HomeVaultDrop[] }) {
  if (drops.length === 0) return null;

  return (
    <section className="border-y border-border/70 bg-gradient-to-b from-primary/5 to-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Limited Time
            </p>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              FLASH SALE
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Exclusive clearance offers from FoodVault partner brands — one shared discount for a
              short time only.
            </p>
          </div>
        </div>

        <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {drops.map((drop) => (
            <VaultDropCard
              key={`${drop.partnerId}-${drop.title}-${drop.direct_store_link}`}
              drop={drop}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
