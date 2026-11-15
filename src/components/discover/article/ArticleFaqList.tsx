"use client";

import { useState } from "react";
import type { DiscoverFaq } from "@/lib/admin/types";

export function ArticleFaqList({ faqs }: { faqs: DiscoverFaq[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  if (faqs.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Questions shoppers ask</h2>
      <div className="mt-6 divide-y divide-border rounded-lg border border-border">
        {faqs.map((faq, index) => {
          const open = openIndex === index;
          return (
            <div key={faq.question}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-base font-semibold text-foreground"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                {faq.question}
                <span aria-hidden="true">{open ? "−" : "+"}</span>
              </button>
              {open ? <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
