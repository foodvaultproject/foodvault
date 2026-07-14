"use client";

import Link from "next/link";
import { useState } from "react";
import { SECTION_PY_HOME_REFINE, SECTION_PY_HOME_PARTNER } from "@/components/home/section-spacing";
import type { FAQItem } from "@/data/faq";

type HomeFAQProps = {
  faqs: FAQItem[];
};

export function HomeFAQ({ faqs, compactSpacing = false }: HomeFAQProps & { compactSpacing?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <section
      className={`bg-background ${
        compactSpacing ? SECTION_PY_HOME_PARTNER : SECTION_PY_HOME_REFINE
      }`}
    >
      <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick answers about membership and savings.
        </p>
        <div
          className={`${
            compactSpacing ? "mt-2" : "mt-4"
          } divide-y divide-border rounded-lg border border-border bg-background shadow-sm`}
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-surface-lavender/40"
                  aria-expanded={isOpen}
                >
                  <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
                    {faq.question}
                  </span>
                  <svg
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen ? (
                  <div className="px-4 pb-3.5">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <Link
          href="/faq"
          className="mt-4 inline-flex text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary-hover"
        >
          View all FAQs →
        </Link>
      </div>
    </section>
  );
}
