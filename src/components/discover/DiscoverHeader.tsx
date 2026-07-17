import { heading1 } from "@/lib/ui-classes";
import { DISCOVER_PAGE_TITLE } from "@/lib/discover/categories";

export function DiscoverHeader() {
  return (
    <section className="bg-gradient-to-b from-surface-lavender via-background to-background pb-7 pt-7 sm:pb-8 sm:pt-10 md:pt-12">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className={heading1}>{DISCOVER_PAGE_TITLE}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
          Explore guides, recipes, member stories and the latest New Zealand brands joining
          FoodVault.
        </p>
      </div>
    </section>
  );
}
