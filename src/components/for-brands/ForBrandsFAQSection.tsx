"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";
import { heading2 } from "@/lib/ui-classes";

type FAQ = {
  question: string;
  answer: string | ReactNode;
};
const faqs: FAQ[] = [
  {
    question: "Is FoodVault really free?",
    answer:
      "Yes. There are no setup fees, no monthly listing fees and no commission on your product sales. FoodVault is free for qualified New Zealand brands to join.",
  },
  {
    question: "Do you charge commission on sales?",
    answer:
      "No. FoodVault never takes a percentage of your product sales. Every purchase is completed on your own website and you keep 100% of your revenue.",
  },
  {
    question: "Who owns the customer?",
    answer:
      "You do. When a member shops with your brand, they purchase directly from your website. You own the customer relationship, customer data and all future marketing opportunities.",
  },
  {
    question: "Where do customers complete their purchase?",
    answer:
      "Always on your website. FoodVault is not a marketplace checkout. We drive qualified traffic to your store — you handle checkout, fulfilment and customer service.",
  },
  {
    question: "How do member discounts work?",
    answer:
      "You set your member offer in your Partner Dashboard — typically a discount code or automatic member pricing on your site. Members reveal your offer on FoodVault, then shop direct with you.",
  },
  {
    question: "Can I change my offers anytime?",
    answer:
      "Yes. Update member offers, brand information, images, products and promotions whenever you like through your Partner Dashboard. No waiting for approvals.",
  },
  {
    question: "Can I run an affiliate program?",
    answer:
      "Yes. FoodVault includes a free, fully integrated affiliate program. Enable it anytime, set your commission rate, track affiliate sales and manage payouts — with no additional software required.",
  },
  {
    question: "Do I need Shopify?",
    answer:
      "No. While many partners use Shopify, it is not required. You need a professional e-commerce website where New Zealand customers can shop directly with you.",
  },
  {
    question: "Can I choose which products receive discounts?",
    answer:
      "Yes. You control your member offer and can structure discounts however suits your business — sitewide, category-based or on selected products.",
  },
  {
    question: "How long does approval take?",
    answer:
      "Most applications are reviewed within 2–3 business days. Our team checks that your brand, imagery and member offer meet FoodVault's quality standards.",
  },
  {
    question: "What types of brands can join?",
    answer:
      "FoodVault partners with independent New Zealand food, beverage, household, pet, baby and health brands — from artisan producers to established direct-to-consumer retailers.",
  },
  {
    question: "How do I apply?",
    answer: (
      <>
        Complete the{" "}
        <Link
          href={PARTNER_CREATE_ACCOUNT_PATH}
          className="font-semibold text-primary hover:text-primary-hover"
        >
          partner application
        </Link>
        . Once approved, build your listing, configure your offers and affiliate settings, then go
        live to start receiving member traffic.
      </>
    ),
  },
];

export function ForBrandsFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-surface py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className={`text-center ${heading2}`}>
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
          FoodVault is free for qualified New Zealand brands — no setup fees, no listing fees and
          no commission on your product sales.
        </p>
        <p className="mx-auto mt-3 flex justify-center">
          <span className="inline-flex rounded-full bg-success-light px-4 py-1.5 text-xs font-semibold text-success sm:text-sm">
            Free to join · No listing fees · 0% commission on your sales
          </span>
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
                {isOpen ? (
                  <div className="px-4 pb-4 sm:px-6 sm:pb-5">
                    {typeof faq.answer === "string" ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                    ) : (
                      <div className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</div>
                    )}
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
