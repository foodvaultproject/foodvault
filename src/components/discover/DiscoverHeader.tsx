"use client";

import { useState } from "react";
import { discoverCategories } from "@/data/discover";
import { heading1 } from "@/lib/ui-classes";

export function DiscoverFilters() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <label htmlFor="discover-search" className="sr-only">
          Search discover content
        </label>
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            id="discover-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, recipes, brands or topics..."
            className="w-full rounded-md border border-border bg-background py-3 pl-12 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-base"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Filter
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Sort
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {discoverCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DiscoverHeader() {
  return (
    <section className="bg-gradient-to-b from-surface-lavender via-background to-background pb-5 pt-7 sm:pb-6 sm:pt-10 md:pt-12">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className={heading1}>
          Discover
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
          Explore guides, recipes, member stories and the latest New Zealand brands joining
          FOODVAULT.
        </p>
      </div>
      <div className="mt-8 sm:mt-10">
        <DiscoverFilters />
      </div>
    </section>
  );
}
