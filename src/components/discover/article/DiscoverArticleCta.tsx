import Link from "next/link";
import { heading2OnDark } from "@/lib/ui-classes";

export function DiscoverArticleCta() {
  return (
    <section className="bg-primary py-7 sm:py-10">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className={heading2OnDark}>
          Never Miss New Member Offers
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
          Discover participating brands, exclusive member discounts and new articles every week.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/browse-brands"
            className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90 sm:w-auto"
          >
            Browse Brands
          </Link>
          <Link
            href="/signup"
            className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            Become a Member
          </Link>
        </div>
      </div>
    </section>
  );
}
