"use client";

import { useState } from "react";
import {
  FAQAccordionQuestion,
  FAQAccordionToggleIcon,
  faqAccordionButtonClassName,
} from "@/components/faq/FAQAccordion";
import { HOME_SECTION_PY } from "@/components/home/section-spacing";
import type { FAQItem } from "@/data/faq";

export function FAQSection({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={`bg-background ${HOME_SECTION_PY}`} id="faq">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Frequently Asked Questions
        </h2>

        <div className="mt-8 divide-y divide-border rounded-lg border border-border sm:mt-10">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className={`${faqAccordionButtonClassName} ${isOpen ? "bg-surface-lavender/40" : ""}`}
                  aria-expanded={isOpen}
                >
                  <FAQAccordionQuestion isOpen={isOpen} className="pr-2 text-sm sm:pr-4 sm:text-base">
                    {faq.question}
                  </FAQAccordionQuestion>
                  <FAQAccordionToggleIcon isOpen={isOpen} />
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
