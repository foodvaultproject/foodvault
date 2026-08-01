import Image from "next/image";
import { DiscountCodeBlock } from "@/components/brands/DiscountCodeBlock";
import type { CodeAccessState } from "@/lib/member/partner-profile";
import {
  calculateMemberPriceLabel,
  formatNzPrice,
  type SelectedProduct,
} from "@/lib/partner-offer";

type SelectedProductGridProps = {
  products: SelectedProduct[];
  horizontal?: boolean;
  embedMemberOffer?: boolean;
  memberCode?: string | null;
  codeState?: CodeAccessState;
  offerExclusions?: string | null;
};

export function SelectedProductGrid({
  products,
  horizontal = false,
  embedMemberOffer = false,
  memberCode = null,
  codeState = "anon",
  offerExclusions = null,
}: SelectedProductGridProps) {
  if (products.length === 0) return null;

  const cards = products.map((product) => {
    const memberPrice =
      product.normalPrice > 0
        ? calculateMemberPriceLabel(
            product.normalPrice.toFixed(2),
            String(product.discountPercent)
          ) ||
          formatNzPrice(product.normalPrice * (1 - product.discountPercent / 100))
        : null;

    const discountBadge =
      embedMemberOffer ? (
        <span className="absolute right-2 top-2 z-10 inline-block -skew-x-12 bg-primary px-[0.5625rem] py-[0.375rem] shadow-sm sm:right-2.5 sm:top-2.5 sm:px-[0.6875rem] sm:py-[0.5625rem]">
          <span className="inline-block skew-x-12 text-[15px] font-bold leading-none text-primary-foreground">
            {product.discountPercent}% OFF
          </span>
        </span>
      ) : (
        <span className="absolute right-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
          {product.discountPercent}% OFF
        </span>
      );

    return (
      <article
        key={product.id}
        className={`flex flex-col overflow-hidden rounded-lg border bg-background shadow-sm ${
          embedMemberOffer
            ? "border-primary/25"
            : "border-border p-2.5 sm:p-3"
        }`}
      >
        <div
          className={`relative aspect-[4/5] overflow-hidden bg-surface ${
            embedMemberOffer ? "" : "rounded-lg"
          }`}
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover"
            unoptimized
          />
          {discountBadge}
        </div>

        <div className={embedMemberOffer ? "flex flex-1 flex-col p-2.5 sm:p-3" : "contents"}>
        <h3 className="mt-2 line-clamp-2 text-xs font-bold text-foreground">
          {product.name}
        </h3>
        <p className="mt-0.5 line-clamp-2 flex-1 text-[11px] leading-snug text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-2 flex items-baseline gap-2">
          {memberPrice ? (
            <>
              <span className="text-sm font-bold text-primary">{memberPrice}</span>
              <span className="text-[11px] text-muted-foreground line-through">
                {formatNzPrice(product.normalPrice)}
              </span>
            </>
          ) : null}
        </div>

        {embedMemberOffer ? (
          <div className="mt-3 space-y-2 border-t border-border/80 pt-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Discount Code
              </p>
              <div className="mt-1">
                <DiscountCodeBlock
                  code={memberCode}
                  state={codeState}
                  variant="card"
                />
              </div>
            </div>
            {offerExclusions ? (
              <p className="text-[10px] leading-snug text-muted-foreground">
                <span className="font-semibold uppercase tracking-wide">Exclusions: </span>
                {offerExclusions}
              </p>
            ) : null}
          </div>
        ) : null}

        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fv-btn-primary mt-3 inline-flex h-8 items-center justify-center rounded-sm px-2.5 text-[11px] font-bold text-primary-foreground transition-[transform,box-shadow] duration-150"
        >
          View Product
        </a>
        </div>
      </article>
    );
  });

  if (horizontal) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      {cards}
    </div>
  );
}
