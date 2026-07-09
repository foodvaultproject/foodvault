"use client";

import Link from "next/link";
import { useState } from "react";
import { affiliateFaqs, getMemberFaqs, partnerFaqs, type FAQItem } from "@/data/faq";

function FAQAnswer({ faq }: { faq: FAQItem }) {
  if (faq.question === "Cancellation and Refunds") {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        You can cancel your FoodVault membership at any time with a single click in your account
        settings. There are no lock-in contracts or hidden fees. For more details on our refund
        policy, please visit our dedicated{" "}
        <Link href="/refund-policy" className="font-semibold text-primary hover:text-primary-hover">
          Refund &amp; Cancellation Policy
        </Link>{" "}
        page.
      </p>
    );
  }

  if (faq.question === "Who do I contact if I need help?") {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        If you have questions about the Affiliate Program, visit our{" "}
        <Link href="/faq" className="font-semibold text-primary hover:text-primary-hover">
          Help Centre
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="font-semibold text-primary hover:text-primary-hover">
          contact the FoodVault support team
        </Link>
        . We&apos;re here to help you get the most out of the program.
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      <p>{faq.answer}</p>
      {faq.bullets?.length ? (
        <ul className="list-disc space-y-1 pl-5">
          {faq.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {faq.closing ? <p>{faq.closing}</p> : null}
    </div>
  );
}

function FAQAccordionGroup({
  id,
  title,
  icon,
  accentClass,
  items,
  openKey,
  onToggle,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  accentClass: string;
  items: FAQItem[];
  openKey: string | null;
  onToggle: (key: string) => void;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className={`mb-6 flex items-center gap-3 ${accentClass}`}>
        {icon}
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
      </div>

      <div className="divide-y divide-border rounded-lg border border-border bg-background">
        {items.map((faq) => {
          const key = `${id}-${faq.question}`;
          const isOpen = openKey === key;

          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => onToggle(key)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-6 sm:py-5"
                aria-expanded={isOpen}
              >
                <span className="min-w-0 flex-1 text-sm font-semibold text-foreground sm:text-base">
                  {faq.question}
                </span>
                <svg
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen ? (
                <div className="px-4 pb-4 sm:px-6 sm:pb-5">
                  <FAQAnswer faq={faq} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FAQCategoryCard({
  children,
  cta,
}: {
  children: React.ReactNode;
  cta: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-[240px] flex-col rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
      <div className="flex flex-1 flex-col">{children}</div>
      <div className="mt-auto pt-6">{cta}</div>
    </div>
  );
}

export function FAQMainContent({ memberFaqs }: { memberFaqs: FAQItem[] }) {
  const [openKey, setOpenKey] = useState<string | null>(
    "member-faqs-What is FOODVAULT?"
  );

  const handleToggle = (key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
          <FAQCategoryCard
            cta={
              <Link
                href="#member-faqs"
                className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
              >
                View Member FAQs
              </Link>
            }
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-primary">
              Members
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Questions about memberships, free trials, billing and using FOODVAULT in New Zealand.
            </p>
          </FAQCategoryCard>

          <FAQCategoryCard
            cta={
              <Link
                href="#partner-faqs"
                className="inline-flex w-full items-center justify-center rounded-lg bg-success px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-success/90 sm:w-auto"
              >
                View Partner FAQs
              </Link>
            }
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
              </svg>
            </div>
            <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-success">
              Partners
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Questions about listing your New Zealand business, managing your profile and reaching
              FOODVAULT members.
            </p>
          </FAQCategoryCard>

          <FAQCategoryCard
            cta={
              <Link
                href="#affiliate-faqs"
                className="inline-flex w-full items-center justify-center rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 sm:w-auto"
              >
                View Affiliate FAQs
              </Link>
            }
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-amber-700">
              Affiliates
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Questions about joining the FoodVault Affiliate Program, referral links, commissions
              and payouts.
            </p>
          </FAQCategoryCard>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <FAQAccordionGroup
          id="member-faqs"
          title="Member FAQs"
          accentClass="text-primary"
          items={memberFaqs}
          openKey={openKey}
          onToggle={handleToggle}
          icon={
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </span>
          }
        />

        <FAQAccordionGroup
          id="partner-faqs"
          title="Partner FAQs"
          accentClass="text-success"
          items={partnerFaqs}
          openKey={openKey}
          onToggle={handleToggle}
          icon={
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-light text-success">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
              </svg>
            </span>
          }
        />

        <FAQAccordionGroup
          id="affiliate-faqs"
          title="FoodVault Affiliate Program FAQ"
          accentClass="text-amber-700"
          items={affiliateFaqs}
          openKey={openKey}
          onToggle={handleToggle}
          icon={
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </span>
          }
        />
      </div>
    </>
  );
}
