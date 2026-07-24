import Link from "next/link";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";
import { heading2, heading3 } from "@/lib/ui-classes";

const partnerBenefits = [
  {
    title: "Free to list",
    description: "No subscription, no listing fees, and no setup costs.",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Zero commission",
    description: "Members buy on your website. You keep every customer and every sale.",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M3.75 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.375M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
        />
      </svg>
    ),
  },
  {
    title: "Reach ready-to-buy members",
    description: "Show up where shoppers are already looking for brands to save with.",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

export function SignupPartnerSection() {
  return (
    <section className="mt-7 border-t border-border pt-7 sm:mt-8 sm:pt-8">
      <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-br from-surface-lavender via-white to-page shadow-card">
        <div className="grid gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-5 lg:p-5">
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-primary">
              For New Zealand brands
            </p>
            <h2 className={`mt-1.5 ${heading2}`}>
              List your brand on FoodVault — it&apos;s free.
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-navy/70">
              Not here to join as a member? FoodVault helps local food, beverage and
              household brands get discovered by shoppers looking for exclusive member
              savings. Create your offer, drive traffic to your own website, and keep full
              control of every customer relationship.
            </p>
            <div className="mt-4 flex flex-col gap-1.5 sm:flex-row sm:items-center">
              <Link
                href={PARTNER_CREATE_ACCOUNT_PATH}
                className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
              >
                Create Partner Account
              </Link>
              <Link
                href="/for-brands"
                className="inline-flex w-full items-center justify-center rounded-sm border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 sm:w-auto"
              >
                How partnering works
              </Link>
            </div>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
            {partnerBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-lg border border-border bg-white/70 p-2 sm:p-2.5"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  {benefit.icon}
                </div>
                <h3 className={`mt-2 ${heading3}`}>{benefit.title}</h3>
                <p className="mt-1 text-[0.7rem] leading-relaxed text-navy/65">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
