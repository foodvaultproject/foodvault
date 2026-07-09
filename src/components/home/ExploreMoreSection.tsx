import Link from "next/link";
import { logoCloud } from "@/data/homepage";

export function ExploreMoreSection() {
  return (
    <section className="bg-surface-lavender py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Explore More
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:mt-10 lg:grid-cols-6 xl:grid-cols-7">
          {logoCloud.map((name) => (
            <div
              key={name}
              className="flex aspect-[3/2] items-center justify-center rounded-lg border border-border bg-background px-2"
            >
              <span className="text-center text-xs font-semibold text-muted-foreground">
                {name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/browse-brands"
            className="inline-flex items-center justify-center rounded-sm border-2 border-primary px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            View All Brands
          </Link>
        </div>
      </div>
    </section>
  );
}
