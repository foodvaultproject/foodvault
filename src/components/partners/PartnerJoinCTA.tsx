import Link from "next/link";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";
import { heading2 } from "@/lib/ui-classes";

const partnerHighlights = [
  {
    title: "Free to Join",
    description: "There is no cost to list your business on FoodVault.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Zero Commission",
    description: "Keep 100% of every sale made through your own website.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M3.75 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.375M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    title: "Direct Customer Traffic",
    description:
      "Members visit your website to redeem exclusive offers and purchase directly from you.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      </svg>
    ),
  },
];

type PartnerJoinCTAProps = {
  learnMoreHref?: string;
  className?: string;
  compact?: boolean;
  showTrustPoints?: boolean;
  showHighlights?: boolean;
  title?: string;
};

export function PartnerJoinCTA({
  learnMoreHref = "/for-brands",
  className = "bg-surface-lavender py-10 sm:py-14",
  compact = false,
  showTrustPoints = true,
  showHighlights = true,
  title = "Own a New Zealand Food, Beverage or Household Brand?",
}: PartnerJoinCTAProps) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
          <div
            className={
              showHighlights
                ? compact
                  ? "grid gap-5 p-4 sm:p-5 lg:grid-cols-2 lg:gap-8 lg:p-6"
                  : "grid gap-10 p-6 sm:p-8 lg:grid-cols-2 lg:gap-16 lg:p-12"
                : compact
                  ? "p-4 sm:p-5 lg:p-6"
                  : "p-6 sm:p-8 lg:p-12"
            }
          >
            <div>
              <h2 className={heading2}>{title}</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Join FoodVault free of charge and connect directly with members looking to save.
                List your business, create an exclusive member offer and drive traffic directly to
                your own website.
              </p>
              {showTrustPoints ? (
                <>
                  <ul className="mt-6 space-y-2 text-sm text-foreground sm:text-base">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-primary" aria-hidden="true">
                        ✓
                      </span>
                      No listing fees
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-primary" aria-hidden="true">
                        ✓
                      </span>
                      No monthly subscription
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-primary" aria-hidden="true">
                        ✓
                      </span>
                      No commissions on sales
                    </li>
                  </ul>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    You keep full ownership of your customers, while FoodVault helps members discover
                    your brand.
                  </p>
                </>
              ) : null}
              <div className={`flex flex-col gap-3 sm:flex-row ${compact ? "mt-4" : "mt-8"}`}>
                <Link
                  href={PARTNER_CREATE_ACCOUNT_PATH}
                  className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-8 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
                >
                  Become a Partner
                </Link>
                <Link
                  href={learnMoreHref}
                  className="inline-flex items-center justify-center rounded-sm border-2 border-primary px-8 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {showHighlights ? (
            <div
              className={
                compact ? "grid grid-cols-3 gap-1.5 sm:grid-cols-1 sm:gap-2" : "grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-4"
              }
            >
              {partnerHighlights.map((item) => (
                <div
                  key={item.title}
                  className={
                    compact
                      ? "rounded-lg border border-border bg-surface/60 p-2 text-center sm:p-3 sm:text-left"
                      : "rounded-lg border border-border bg-surface/60 p-3 text-center sm:p-6 sm:text-left"
                  }
                >
                  <div
                    className={
                      compact
                        ? "mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0 sm:h-8 sm:w-8"
                        : "mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0 sm:h-11 sm:w-11"
                    }
                  >
                    {item.icon}
                  </div>
                  <h3
                    className={
                      compact
                        ? "mt-2 text-[11px] font-bold leading-tight text-foreground sm:mt-3 sm:text-sm"
                        : "mt-3 text-[11px] font-bold leading-tight text-foreground sm:mt-4 sm:text-sm"
                    }
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 hidden text-sm leading-relaxed text-muted-foreground sm:block">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
