"use client";

import { useState } from "react";
import {
  FAQAccordionQuestion,
  FAQAccordionToggleIcon,
  faqAccordionButtonClassName,
} from "@/components/faq/FAQAccordion";
import { heading2 } from "@/lib/ui-classes";

const faqs = [
  {
    question: "How does a FoodVault membership help me save?",
    answer:
      "Your FoodVault membership gives you access to exclusive discounts and offers from participating New Zealand food, beverage and household brands. Shop directly with our partner brands and use your member discount codes at checkout to unlock exclusive savings.",
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
    question: "Can I browse discounts without paying?",
    answer:
      "Yes. Anyone can browse brands and see advertised member discounts. A paid membership is required to reveal and copy promo codes.",
  },
] as const;

export function PricingFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
                  className={`${faqAccordionButtonClassName} ${isOpen ? "bg-surface-lavender/40" : ""}`}
                  aria-expanded={isOpen}
                >
                  <FAQAccordionQuestion isOpen={isOpen} className="text-sm sm:text-base">
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
