"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const DEPARTMENT_ALIASES: Record<string, { department: string; subcategory?: string }> = {
  protein: { department: "Health & Body", subcategory: "Sports Nutrition & Weight Management" },
  "pet food": { department: "Pet" },
  coffee: { department: "Drinks", subcategory: "Coffee" },
  snacks: { department: "Pantry", subcategory: "Snacks & Sweets" },
  supplements: { department: "Health & Body", subcategory: "Vitamins & Supplements" },
  honey: { department: "Pantry" },
  collagen: { department: "Health & Body", subcategory: "Vitamins & Supplements" },
};

function buildBrowseHref(query: string, isPartner = false): string {
  const basePath = isPartner ? "/" : "/browse-brands";
  const trimmed = query.trim();
  if (!trimmed) return basePath;

  const alias = DEPARTMENT_ALIASES[trimmed.toLowerCase()];
  if (alias) {
    const params = new URLSearchParams({ department: alias.department });
    if (alias.subcategory) {
      params.set("subcategory", alias.subcategory);
    }
    return `${basePath}?${params.toString()}`;
  }

  return basePath;
}

export function NavSearch({ isPartner = false }: { isPartner?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push(buildBrowseHref(query, isPartner));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative hidden min-w-0 flex-[1.2] xl:block xl:min-w-[18rem] xl:max-w-[34rem]"
      role="search"
      aria-label="Search brands"
    >
      <label htmlFor="nav-search" className="sr-only">
        Search brands, products or categories
      </label>
      <input
        id="nav-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search brands, products or categories..."
        className="h-10 w-full rounded-md border border-border bg-background py-2 pl-4 pr-11 text-sm text-foreground shadow-sm placeholder:text-muted-light transition-[border-color,box-shadow] duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5"
        aria-label="Search"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
          />
        </svg>
      </button>
    </form>
  );
}
