"use client";

import { useState } from "react";
import { heading2 } from "@/lib/ui-classes";

const baseFaqs = [
  {
    question: "How does a FoodVault membership help me save?",
    answer:
      "Your membership unlocks exclusive member pricing from 900+ independent food and beverage brands across New Zealand. When you shop direct on each partner's website, member rates are applied at their checkout — typically saving 20–40% on products you already buy.",
  },
  {
    question: "Can I cancel my membership anytime?",
    answer:
      "Yes. Cancel anytime from your account settings with no lock-in contracts. Your access continues until the end of your current billing period.",
  },
  {
    question: "Where do I shop?",
    answer:
      "FoodVault is not a marketplace or checkout platform. You browse member offers on FoodVault, then shop directly on each brand's own website. They handle payment, shipping, and customer service.",
  },
  {
    question: "Is the free trial really free?",
    answer: (trialLengthDays: number) =>
      `Yes. Start a ${trialLengthDays}-day free trial with no payment card required. Explore member pricing across all partner brands and cancel before your trial ends if it's not for you.`,
  },
] as const;

type PricingFAQSectionProps = {
  trialLengthDays: number;
};

export function PricingFAQSection({ trialLengthDays }: PricingFAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = baseFaqs.map((faq) => ({
    question: faq.question,
    answer: typeof faq.answer === "function" ? faq.answer(trialLengthDays) : faq.answer,
  }));

  return (
    <section className="bg-surface-lavender py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className={`text-center ${heading2}`}>
          Pricing Questions?
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground sm:text-base">
          Everything you need to know about the FoodVault membership.
        </p>

        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-background sm:mt-10">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
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
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-6 sm:pb-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
