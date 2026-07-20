import Image from "next/image";
import {
  calculateMemberPriceLabel,
  formatNzPrice,
  type SelectedProduct,
} from "@/lib/partner-offer";

type SelectedProductGridProps = {
  products: SelectedProduct[];
  horizontal?: boolean;
};

export function SelectedProductGrid({
  products,
  horizontal = false,
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

    return (
      <article
        key={product.id}
        className="flex flex-col rounded-lg border border-border bg-background p-2.5 shadow-sm sm:p-3"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover p-1"
            unoptimized
          />
          <span className="absolute right-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            {product.discountPercent}% OFF
          </span>
        </div>

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

        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fv-btn-primary mt-2 inline-flex h-8 items-center justify-center rounded-sm px-2.5 text-[11px] font-bold text-primary-foreground transition-[transform,box-shadow] duration-150"
        >
          View Product
        </a>
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
