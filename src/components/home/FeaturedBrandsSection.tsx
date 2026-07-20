import Image from "next/image";
import Link from "next/link";
import { featuredBrands } from "@/data/homepage";

export function FeaturedBrandsSection() {
  return (
    <section className="bg-surface-lavender py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Featured Brands
        </h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          {featuredBrands.map((brand) => (
            <article
              key={brand.name}
              className="overflow-hidden rounded-lg border border-border bg-background shadow-sm"
            >
              <div className="relative aspect-[3/2]">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                />
                <span className="absolute right-3 top-3 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-white">
                  {brand.discount}
                </span>
                <div className="absolute -bottom-5 left-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-bold text-white">
                  {brand.name.charAt(0)}
                </div>
              </div>

              <div className="p-5 pt-8">
                <h3 className="font-bold text-foreground">{brand.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {brand.description}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    Learn More
                  </Link>
                  <Link
                    href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:shrink-0"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
