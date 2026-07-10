import Image from "next/image";
import type { SelectedProduct } from "@/lib/partner-offer";

type SelectedProductGridProps = {
  products: SelectedProduct[];
  horizontal?: boolean;
};

export function SelectedProductGrid({
  products,
  horizontal = false,
}: SelectedProductGridProps) {
  if (products.length === 0) return null;

  const cards = products.map((product) => (
        <article
          key={product.id}
          className={`flex flex-col rounded-lg border border-border bg-background p-2.5 shadow-sm ${
            horizontal
              ? "w-[28%] shrink-0 snap-start sm:w-[168px] lg:w-auto"
              : "p-3"
          }`}
        >
          <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover"
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

          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fv-btn-primary mt-2 inline-flex h-8 items-center justify-center rounded-sm px-2.5 text-[11px] font-bold text-primary-foreground transition-[transform,box-shadow] duration-150"
          >
            View Product
          </a>

          {product.conditions ? (
            <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
              {product.conditions}
            </p>
          ) : null}
        </article>
  ));

  if (!horizontal) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {cards}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:overflow-visible lg:snap-none">
        {cards}
      </div>
      {/* Scroll cue: right-edge fade hinting more products (mobile/tablet only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-end bg-gradient-to-l from-background via-background/80 to-transparent lg:hidden"
      >
        <svg
          className="h-5 w-5 text-primary/70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
