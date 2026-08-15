import Link from "next/link";

const EXPLORE_BRANDS_PATH = "/";

function ExploreBrandsButton({ className }: { className?: string }) {
  return (
    <Link
      href={EXPLORE_BRANDS_PATH}
      className={`fv-btn-primary inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 ${className ?? ""}`}
    >
      Explore Brands
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </Link>
  );
}

export function WelcomeScreen() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-surface-lavender via-white to-page p-8 text-center shadow-sm sm:p-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-success-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-success">
          Membership Active
        </span>
        <h1 className="mt-5 text-[2.25rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[2.75rem]">
          🎉 Welcome to <span className="text-primary">FoodVault!</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Your FoodVault Membership is now active. You now have unlimited access to exclusive member pricing from participating New Zealand brands.
        </p>
        <div className="mt-8 flex justify-center">
          <ExploreBrandsButton className="w-full sm:w-auto" />
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-background p-6 text-left shadow-sm sm:p-8">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Your Membership Includes
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            "Unlimited access to member pricing",
            "Exclusive partner offers",
            "Unlimited brand browsing",
            "Ongoing access while your membership remains active",
          ].map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-xs font-bold text-white">
                ✓
              </span>
              <span className="text-sm text-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          Shop directly with participating brands using your exclusive FoodVault member discount codes.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-center text-xl font-bold tracking-tight text-foreground">
          Getting Started
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "🔍",
              title: "Browse Partner Brands",
              description:
                "Explore participating New Zealand food, beverage and household brands.",
            },
            {
              icon: "💰",
              title: "Unlock Member Pricing",
              description:
                "Every partner listing includes exclusive member-only discount codes available with your membership.",
            },
            {
              icon: "🛒",
              title: "Shop Directly",
              description:
                "Purchase directly from each partner's own website using your FoodVault member code.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-border bg-background p-6 text-left shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-2xl">
                {card.icon}
              </span>
              <h3 className="mt-4 text-sm font-bold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-start gap-4 rounded-lg border border-primary/20 bg-primary/5 p-6 text-left sm:p-8">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg text-primary-foreground">
          ★
        </span>
        <div>
          <h3 className="text-base font-bold text-foreground">You&apos;re officially a FoodVault Member</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Thank you for supporting FoodVault and the growing community of Kiwi brands. Your membership helps us continue adding new partner brands and negotiating more exclusive offers for members.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-background p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Start Saving Today
        </h2>
        <div className="mt-5 flex justify-center">
          <ExploreBrandsButton className="w-full sm:w-auto" />
        </div>
      </div>
    </div>
  );
}
