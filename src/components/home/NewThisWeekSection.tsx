import Link from "next/link";
import { newBrands } from "@/data/homepage";

export function NewThisWeekSection() {
  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          New This Week
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:grid-cols-4 sm:gap-6">
          {newBrands.map((brand) => (
            <Link
              key={brand.name}
              href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="flex flex-col items-center rounded-lg border border-border bg-background p-4 text-center transition-shadow hover:shadow-md sm:p-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-lavender text-xl font-bold text-primary sm:h-20 sm:w-20 sm:text-2xl">
                {brand.name.charAt(0)}
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{brand.name}</h3>
              <span className="mt-2 inline-flex rounded-full bg-success-light px-2.5 py-0.5 text-xs font-medium text-success">
                {brand.tag}
              </span>
              <span className="mt-4 text-sm font-semibold text-primary">
                View Brand
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
