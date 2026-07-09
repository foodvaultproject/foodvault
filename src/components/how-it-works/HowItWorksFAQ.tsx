"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQItem } from "@/data/faq";
import { heading2, heading3 } from "@/lib/ui-classes";

type HowItWorksFAQProps = {
  memberFaqs: FAQItem[];
  partnerFaqs: FAQItem[];
};

function FAQColumn({ title, items }: { title: string; items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <h3 className={heading3}>{title}</h3>
      <div className="mt-3 divide-y divide-border rounded-lg border border-border bg-background shadow-card">
        {items.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-surface/80"
                aria-expanded={isOpen}
              >
                <span className="min-w-0 flex-1 text-[13px] font-semibold text-foreground">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  strokeWidth={2}
                />
              </button>
              {isOpen ? (
                <div className="px-4 pb-3">
                  <p className="text-[13px] leading-relaxed text-muted">{faq.answer}</p>
                  {faq.bullets?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[13px] text-muted">
                      {faq.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                  {faq.closing ? (
                    <p className="mt-2 text-[13px] leading-relaxed text-muted">{faq.closing}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HowItWorksFAQ({ memberFaqs, partnerFaqs }: HowItWorksFAQProps) {
  return (
    <section className="bg-page py-[60px]">
      <div className="fv-content-width">
        <h2 className={`text-center ${heading2}`}>
          Questions? We have answers.
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8">
          <FAQColumn title="For Members" items={memberFaqs} />
          <FAQColumn title="For Brands" items={partnerFaqs} />
        </div>
      </div>
    </section>
  );
}
