import { formatCurrency } from "@/lib/locale";

const features = [
  "Exclusive Member Pricing",
  "Direct-to-Consumer",
  "Curated Selection",
];

export function WhyJoinSection() {
  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Join FoodVault?
            </h2>
            <ul className="mt-8 space-y-5">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span className="text-lg font-medium text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8 md:p-10">
            <div className="mx-auto flex max-w-xs flex-col items-center text-center">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90 text-primary" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="220 264"
                    strokeLinecap="round"
                  />
                </svg>
                <div>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(127)}</p>
                  <p className="text-xs font-medium text-muted-foreground">per month</p>
                </div>
              </div>
              <p className="mt-6 text-lg font-bold text-foreground">Avg. Member Savings</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Based on active member shopping data across 900+ New Zealand partner brands.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
