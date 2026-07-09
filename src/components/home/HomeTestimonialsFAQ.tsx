"use client";

import Link from "next/link";
import { useState } from "react";
import { testimonials } from "@/data/homepage";
import { SECTION_PY_HOME_REFINE } from "@/components/home/section-spacing";
import type { FAQItem } from "@/data/faq";

type HomeTestimonialsFAQProps = {
  faqs: FAQItem[];
  showFaq?: boolean;
};

export function HomeTestimonialsFAQ({
  faqs,
  showFaq = true,
}: HomeTestimonialsFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!showFaq) {
    return (
      <section className={`bg-surface-lavender/40 ${SECTION_PY_HOME_REFINE}`}>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            What Members Are Saying
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real feedback from members saving with FoodVault.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="flex flex-col rounded-lg border border-border bg-background p-4 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="text-sm text-primary" aria-hidden="true">
                  {"★★★★★"}
                </div>
                <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-xs font-semibold text-foreground">
                  {testimonial.name}
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {testimonial.location}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-background ${SECTION_PY_HOME_REFINE}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              What Members Are Saying
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real feedback from shoppers saving with FoodVault.
            </p>
            <div className="mt-4 space-y-3">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.name}
                  className="rounded-lg border border-border bg-surface-lavender/50 p-4 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className="text-sm text-primary" aria-hidden="true">
                    {"★★★★★"}
                  </div>
                  <blockquote className="mt-2 text-sm leading-relaxed text-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-3 text-xs font-semibold text-foreground">
                    {testimonial.name}
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · {testimonial.location}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quick answers about membership and savings.
            </p>
            <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-background shadow-sm">
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
        </div>
      </div>
    </section>
  );
}
