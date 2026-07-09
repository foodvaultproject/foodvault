import Link from "next/link";
import { categories } from "@/data/homepage";

export function ShopByCategorySection() {
  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Shop by Category
          </h2>
          <Link
            href="/categories"
            className="hidden shrink-0 text-sm font-semibold text-primary hover:text-primary-hover md:inline-flex md:items-center md:gap-1"
          >
            See all
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 sm:mt-10 sm:gap-6 md:grid md:grid-cols-5 md:overflow-visible lg:grid-cols-9">
          {categories.map((category) => (
            <Link
              key={category.label}
              href={`/categories/${category.label.toLowerCase()}`}
              className="flex w-[4.5rem] shrink-0 flex-col items-center gap-2 sm:w-auto md:w-auto"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-lavender text-xl transition-colors hover:bg-primary/10 sm:h-16 sm:w-16 sm:text-2xl">
                {category.emoji}
              </div>
              <span className="text-sm font-medium text-foreground">
                {category.label}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/categories"
          className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary-hover md:hidden"
        >
          See all &rarr;
        </Link>
      </div>
    </section>
  );
}
