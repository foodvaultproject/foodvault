import Image from "next/image";
import Link from "next/link";
import { popularBrands } from "@/data/homepage";

export function PopularBrandsSection() {
  return (
    <section className="bg-surface py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Our Most Popular Brands
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4">
          {popularBrands.map((brand) => (
            <Link
              key={brand.name}
              href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={brand.image}
                alt={brand.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <span className="absolute bottom-2 left-2 text-xs font-semibold text-white sm:bottom-3 sm:left-3 sm:text-sm">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
