import Image from "next/image";
import { SECTION_PY_HOME_REFINE } from "@/components/home/section-spacing";

export function AboutHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#EEF2FF] via-background to-primary/5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-8 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1200px] px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
          Supporting Kiwi Brands. Helping Kiwis Save.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          FoodVault helps Kiwis discover great local brands, unlock exclusive member savings,
          and shop directly from the businesses behind the products they love.
        </p>
      </div>
    </section>
  );
}

export function AboutValueSplitSection() {
  return (
    <section className={`bg-background ${SECTION_PY_HOME_REFINE}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Why FoodVault
        </h2>
        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-2 lg:gap-8">
          <article className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              For Members
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Discover amazing Kiwi brands, unlock exclusive member savings, and shop directly
              with confidence. Whether you&apos;re buying everyday essentials or discovering
              something new, FoodVault helps you get more for your money while supporting local
              businesses.
            </p>
          </article>

          <article className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              For Brands
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              FoodVault helps more people discover your business and sends shoppers directly to
              your website. Create your free profile, promote your products, control your offers,
              and connect with customers who are actively looking for brands like yours.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function AboutFounderSection() {
  return (
    <section
      id="meet-the-founder"
      className={`scroll-mt-24 border-y border-border bg-surface ${SECTION_PY_HOME_REFINE}`}
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 lg:px-8">
        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-sm ring-1 ring-border lg:mx-0 lg:max-w-none">
          <Image
            src="/about/founder-mark.png"
            alt="Mark Coulston, founder of FoodVault"
            width={1080}
            height={1350}
            className="h-auto w-full object-cover"
            sizes="(max-width: 1024px) 90vw, 480px"
            unoptimized
            priority={false}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Meet the Founder
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p className="font-medium text-foreground">Hi, I&apos;m Mark Coulston.</p>
            <p>
              Having owned a Four Square (Foodstuffs North Island) and built wholesale
              distribution across two continents, I&apos;ve seen the retail game from every
              angle—from early pitch meetings landing first shelf spots to nationwide
              rollouts.
            </p>
            <p>
              If there&apos;s one thing I know, it&apos;s that building a brand takes serious
              time and grit. New Zealand is a tough market with tight retail channels, and
              building a loyal base of everyday supporters is the real foundation of any
              lasting business.
            </p>
            <p>
              That&apos;s why I built FoodVault: to give Kiwi brands a direct connection to
              loyal customers, while giving Kiwi families genuine value on the products they
              love.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
