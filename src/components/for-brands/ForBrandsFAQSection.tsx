"use client";

import { useState } from "react";
import { heading2 } from "@/lib/ui-classes";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "Is FoodVault really free for brands?",
    answer:
      "Yes. There are no setup fees, no monthly listing fees and no commission on your product sales. FoodVault is free for qualified New Zealand brands to join.",
  },
  {
    question: "How do customers purchase from us?",
    answer:
      "Always on your website. FoodVault is not a marketplace checkout. We drive qualified traffic to your store — you handle checkout, fulfilment and customer service.",
  },
  {
    question: "Can I choose which products receive discounts?",
    answer:
      "Yes. You control your member offer and can structure discounts however suits your business — sitewide, category-based or on selected products.",
  },
  {
    question: "Can I update my offers at any time?",
    answer:
      "Yes. Update member offers, brand information, images, products and promotions whenever you like through your Partner Dashboard.",
  },
  {
    question: "Do I need an online store?",
    answer:
      "Yes. You need a professional e-commerce website where New Zealand customers can shop directly with you. Shopify is not required.",
  },
  {
    question: "How long does approval take?",
    answer:
      "Most applications are reviewed within 2–3 business days. Our team checks that your brand, imagery and member offer meet FoodVault's quality standards.",
  },
  {
    question: "How do I manage my listing?",
    answer:
      "From your Partner Dashboard you can update your company profile, upload products and gallery images, create and manage member offers, edit categories and brand information, view performance analytics and access partner support.",
  },
  {
    question: "Can I leave FoodVault at any time?",
    answer:
      "Yes. There are no long-term contracts. You can leave FoodVault whenever you choose.",
  },
];

export function ForBrandsFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-surface py-8 sm:py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className={`text-center ${heading2}`}>Frequently Asked Questions</h2>

        <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-background sm:mt-8">
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
                {isOpen ? (
                  <div className="px-4 pb-4 sm:px-6 sm:pb-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
