import type { ReactNode } from "react";
import { formatTrialLengthDays } from "@/lib/member/pricing";

type Benefit =
  | { title: string; icon: ReactNode; description: string }
  | {
      title: string;
      icon: ReactNode;
      getDescription: (trialLengthDays: number) => string;
    };

const benefits: Benefit[] = [
  {
    title: "Save on Your First Order",
    description:
      "Unlock member pricing immediately. Most members save on their very first shop direct purchase.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Exclusive Access",
    description:
      "Member-only pricing from 900+ independent food and beverage brands across New Zealand you won't find anywhere else.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5M4.5 10.5h15m-15 0a3 3 0 00-3 3v6.75a3 3 0 003 3h15a3 3 0 003-3v-6.75a3 3 0 00-3-3" />
      </svg>
    ),
  },
  {
    title: "Cancel Anytime",
    getDescription: (trialLengthDays: number) =>
      `No lock-in contracts. Start with a ${formatTrialLengthDays(trialLengthDays)} free trial and cancel whenever you want — no questions asked.`,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function WhyFreeTrialSection({
  trialLengthDays,
}: {
  trialLengthDays: number;
}) {
  return (
    <section className="bg-surface py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Start a Free Trial?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Try FoodVault risk-free and see how much you can save every month.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3 lg:mt-14">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                {item.icon}
              </div>
              <h3 className="mt-6 text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {"getDescription" in item
                  ? item.getDescription(trialLengthDays)
                  : item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
