import { formatCurrency } from "@/lib/locale";

const stats = [
  { value: "900+", label: "Partner Brands" },
  { value: `${formatCurrency(1500000, { maximumFractionDigits: 0 })}+`, label: "Saved by Members" },
  { value: "28k", label: "Community Reviews" },
];

export function StatsBar() {
  return (
    <section className="bg-primary">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/20 px-4 py-8 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 sm:py-10 md:py-10 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="px-2 py-4 text-center first:pt-0 last:pb-0 sm:py-0">
            <p className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm font-medium uppercase tracking-wider text-white/80">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
