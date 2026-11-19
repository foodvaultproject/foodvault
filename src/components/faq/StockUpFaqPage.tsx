"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  STOCKUP_FAQ_CATEGORIES,
  type StockUpFaqSegment,
} from "@/data/stockup-faq";

function AnswerParagraph({ segments }: { segments: StockUpFaqSegment[] }) {
  return (
    <p>
      {segments.map((segment, index) =>
        segment.href ? (
          <Link
            key={`${segment.href}-${index}`}
            href={segment.href}
            className="font-semibold text-[#064E3B] underline decoration-[#064E3B]/30 underline-offset-2 hover:decoration-[#064E3B]"
          >
            {segment.text}
          </Link>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        )
      )}
    </p>
  );
}

export function StockUpFaqPage() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const categories = useMemo(() => {
    if (!normalized) return STOCKUP_FAQ_CATEGORIES;

    return STOCKUP_FAQ_CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        const haystack = [
          category.title,
          item.question,
          ...item.paragraphs.flatMap((paragraph) => paragraph.map((segment) => segment.text)),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalized);
      }),
    })).filter((category) => category.items.length > 0);
  }, [normalized]);

  const matchCount = categories.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <div className="bg-white text-slate-700">
      <section className="border-b border-slate-200 bg-[#064E3B] text-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-emerald-100">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-white">FAQ</li>
            </ol>
          </nav>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            New Zealand online grocery shopping FAQ
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50 sm:text-lg">
            Easy online shopping, fast pantry delivery, saved grocery lists, and a wide range of
            organic products. Answers for shoppers who want to reorder basic essentials without
            running out.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <label className="block">
          <span className="text-sm font-semibold text-[#064E3B]">Search questions</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try organic pantry, shopping list, or NZ Post"
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none ring-[#064E3B] placeholder:text-slate-400 focus:border-[#064E3B] focus:ring-2"
          />
        </label>

        <nav aria-label="FAQ categories" className="mt-6 flex flex-wrap gap-2">
          {STOCKUP_FAQ_CATEGORIES.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="rounded-full border border-[#064E3B]/20 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-[#064E3B] hover:bg-emerald-100"
            >
              {category.title}
            </a>
          ))}
        </nav>

        {normalized ? (
          <p className="mt-4 text-sm text-slate-500" aria-live="polite">
            {matchCount === 0
              ? "No matching questions. Try a shorter phrase."
              : `${matchCount} matching ${matchCount === 1 ? "question" : "questions"}.`}
          </p>
        ) : null}

        <div className="mt-10 space-y-12">
          {categories.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-24">
              <h2 className="text-2xl font-bold tracking-tight text-[#064E3B]">{category.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{category.intro}</p>
              <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {category.items.map((item) => (
                  <details key={item.question} className="group px-4 py-1 sm:px-5">
                    <summary className="cursor-pointer list-none py-4 text-base font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-start justify-between gap-4">
                        <span>{item.question}</span>
                        <span
                          aria-hidden="true"
                          className="mt-0.5 text-xl leading-none text-[#064E3B] group-open:hidden"
                        >
                          +
                        </span>
                        <span
                          aria-hidden="true"
                          className="mt-0.5 hidden text-xl leading-none text-[#064E3B] group-open:inline"
                        >
                          −
                        </span>
                      </span>
                    </summary>
                    <div className="space-y-3 pb-4 text-sm leading-relaxed text-slate-600">
                      {item.paragraphs.map((paragraph, index) => (
                        <AnswerParagraph key={index} segments={paragraph} />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-14 rounded-2xl bg-[#064E3B] px-6 py-8 text-white sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">Explore and Shop Now</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50">
            Browse the StockUp shop and order for New Zealand-wide delivery.
          </p>
          <Link
            href="/pantry"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-white bg-transparent px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            Explore and Shop Now
          </Link>
        </section>
      </div>
    </div>
  );
}
