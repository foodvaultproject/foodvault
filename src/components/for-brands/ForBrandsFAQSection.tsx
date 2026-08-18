"use client";

import { useState } from "react";
import {
  FAQAccordionQuestion,
  FAQAccordionToggleIcon,
  faqAccordionButtonClassName,
} from "@/components/faq/FAQAccordion";
import { heading2 } from "@/lib/ui-classes";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "Is FoodVault really free for businesses?",
    answer:
      "Yes. There are no setup fees, listing fees, or sales commissions. It is 100% free for qualified Kiwi brands and hospitality venues.",
  },
  {
    question: "How do customers purchase from us?",
    answer:
      "Online businesses send customers to your website. Hospitality venues welcome members in person at the counter. FoodVault is not a marketplace checkout — you handle the sale, service and customer experience.",
  },
  {
    question: "Can I choose which products receive discounts?",
    answer:
      "Yes. You control your member offer and can structure discounts however suits your business — sitewide, category-based, selected products, or an in-store counter perk.",
  },
  {
    question: "Can I update my offers at any time?",
    answer:
      "Yes. Update member offers, business information, images, products and promotions whenever you like through your Partner Dashboard.",
  },
  {
    question: "Do I need an online store?",
    answer:
      "No! Online brands can offer web promo codes, while hospitality venues (cafes, restaurants, bakeries, delis) can host in-store member perks redeemed directly at the counter.",
  },
  {
    question: "How long does approval take?",
    answer:
      "Our team typically reviews and approves your listing within 24 hours. We check that your business, imagery and member offer meet FoodVault's quality standards.",
  },
  {
    question: "How do I manage my listing?",
    answer:
      "From your Partner Dashboard you can update your company or venue profile, upload products and gallery images, create and manage member offers, edit categories and business information, view performance analytics and access partner support.",
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
