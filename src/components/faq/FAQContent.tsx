"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FAQAccordionQuestion,
  FAQAccordionToggleIcon,
  faqAccordionButtonClassName,
} from "@/components/faq/FAQAccordion";
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
  items,
  openKey,
  onToggle,
}: {
  id: string;
  title: string;
  items: FAQItem[];
  openKey: string | null;
  onToggle: (key: string) => void;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">{title}</h2>

      <div className="divide-y divide-border rounded-lg border border-border bg-background">
        {items.map((faq) => {
          const key = `${id}-${faq.question}`;
          const isOpen = openKey === key;

          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => onToggle(key)}
                className={`${faqAccordionButtonClassName} ${isOpen ? "bg-surface-lavender/40" : ""}`}
                aria-expanded={isOpen}
              >
                <FAQAccordionQuestion isOpen={isOpen} className="text-sm sm:text-base">
                  {faq.question}
                </FAQAccordionQuestion>
                <FAQAccordionToggleIcon isOpen={isOpen} />
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
    "member-faqs-What is FoodVault?"
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
            <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
              Members
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Questions about memberships, billing and using FOODVAULT in New Zealand.
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
            <h2 className="text-sm font-bold uppercase tracking-wide text-success">
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
            <h2 className="text-sm font-bold uppercase tracking-wide text-amber-700">
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
          items={memberFaqs}
          openKey={openKey}
          onToggle={handleToggle}
        />

        <FAQAccordionGroup
          id="partner-faqs"
          title="Business FAQ"
          items={partnerFaqs}
          openKey={openKey}
          onToggle={handleToggle}
        />

        <FAQAccordionGroup
          id="affiliate-faqs"
          title="FoodVault Affiliate Program FAQ"
          items={affiliateFaqs}
          openKey={openKey}
          onToggle={handleToggle}
        />
      </div>
    </>
  );
}
