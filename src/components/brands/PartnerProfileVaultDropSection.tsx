"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DiscountCodeBlock } from "@/components/brands/DiscountCodeBlock";
import type { CodeAccessState } from "@/lib/member/partner-profile";
import {
  formatVaultDropDiscountLabel,
  formatVaultDropPrice,
  getVaultDropCountdownParts,
  resolveVaultDropDiscountPercent,
  type VaultDropProductStored,
  type VaultDropStored,
} from "@/lib/vault-drop";
import {
  VaultDropCountdownBadge,
  VaultDropDiscountBadge,
  VaultDropReasonTag,
} from "@/components/vault-drop/VaultDropCardBadges";

const SECTION_CARD =
  "rounded-lg border border-border bg-background p-4 shadow-sm sm:p-5";

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
      <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
        No image
      </div>
    );
  }

  return (
    <>
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 280px"
        className="object-cover"
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

function ProfileVaultDropProductCard({
  product,
  countdownEndTime,
  discountPercent,
  flashSaleCode,
  codeState,
}: {
  product: VaultDropProductStored;
  countdownEndTime: string | null;
  discountPercent: number;
  flashSaleCode: string | null;
  codeState: CodeAccessState;
}) {
  const [expired, setExpired] = useState(() =>
    getVaultDropCountdownParts(countdownEndTime).expired
  );

  return (
    <article
      className={`flex w-[16.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm sm:w-[18rem] ${
        expired ? "opacity-60 grayscale" : ""
      }`}
    >
      <div className="relative aspect-[4/3] bg-muted">
        <VaultDropImageCarousel images={product.image_urls} />
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5">
          {countdownEndTime ? (
            <VaultDropCountdownBadge
              endTimeIso={countdownEndTime}
              onExpired={() => setExpired(true)}
            />
          ) : null}
          <VaultDropDiscountBadge
            label={formatVaultDropDiscountLabel(discountPercent)}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <VaultDropReasonTag label={product.reason_tag} />
        <h3 className="line-clamp-2 text-sm font-bold text-foreground">{product.title}</h3>
        {product.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        ) : null}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground line-through">
            {formatVaultDropPrice(product.original_price)}
          </span>
          <span className="text-base font-bold text-primary">
            {formatVaultDropPrice(product.clearance_price)}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 border-t border-border/80 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            FLASH SALE Code
          </p>
          <DiscountCodeBlock code={flashSaleCode} state={codeState} variant="card" />
        </div>

        {expired ? (
          <span className="fv-btn-secondary mt-3 inline-flex items-center justify-center rounded-sm px-3 py-2 text-xs font-semibold opacity-70">
            Offer Ended
          </span>
        ) : (
          <Link
            href={product.direct_store_link}
            target="_blank"
            rel="noopener noreferrer"
            className="fv-btn-primary mt-3 inline-flex items-center justify-center rounded-sm px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            Shop This Offer
          </Link>
        )}
      </div>
    </article>
  );
}

export function PartnerProfileVaultDropSection({
  vaultDrop,
  flashSaleCode,
  codeState,
}: {
  vaultDrop: VaultDropStored | null;
  flashSaleCode: string | null;
  codeState: CodeAccessState;
}) {
  if (!vaultDrop?.products.length) return null;

  const discountPercent = resolveVaultDropDiscountPercent(vaultDrop);

  return (
    <section id="flash-sale" className={SECTION_CARD}>
      <h2 className="text-sm font-semibold text-foreground">FLASH SALE</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Limited-time clearance offers available exclusively to FoodVault members. Use your
        FLASH SALE code on any item below.
      </p>
      <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {vaultDrop.products.map((product) => (
          <ProfileVaultDropProductCard
            key={`${product.title}-${product.direct_store_link}`}
            product={product}
            countdownEndTime={vaultDrop.countdown_end_time}
            discountPercent={discountPercent}
            flashSaleCode={flashSaleCode}
            codeState={codeState}
          />
        ))}
      </div>
    </section>
  );
}
