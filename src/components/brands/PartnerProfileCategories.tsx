"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PartnerCategoryGroup } from "@/data/partner-categories";

const VISIBLE_CATEGORY_LIMIT = 2;

const categoryTagClassName =
  "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20";

type CategoryTag = {
  department: string;
  category: string;
};

type PartnerProfileCategoriesProps = {
  categoryGroups: PartnerCategoryGroup[];
  browseCategoryHref: (department: string, subcategory?: string) => string;
};

function flattenCategoryTags(groups: PartnerCategoryGroup[]): CategoryTag[] {
  return groups.flatMap((group) =>
    group.subcategories.map((category) => ({
      department: group.department,
      category,
    }))
  );
}

export function PartnerProfileCategories({
  categoryGroups,
  browseCategoryHref,
}: PartnerProfileCategoriesProps) {
  const [showAll, setShowAll] = useState(false);

  const groupsWithCategories = useMemo(
    () => categoryGroups.filter((group) => group.subcategories.length > 0),
    [categoryGroups]
  );

  const allTags = useMemo(
    () => flattenCategoryTags(groupsWithCategories),
    [groupsWithCategories]
  );

  if (allTags.length === 0) return null;

  const hasHiddenCategories = allTags.length > VISIBLE_CATEGORY_LIMIT;
  const visibleTags = showAll ? allTags : allTags.slice(0, VISIBLE_CATEGORY_LIMIT);

  return (
    <div className="mt-4 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Categories
      </p>

      {showAll ? (
        groupsWithCategories.map((group) => (
          <div key={group.department}>
            <p className="text-sm font-semibold text-foreground">{group.department}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.subcategories.map((category) => (
                <Link
                  key={`${group.department}-${category}`}
                  href={browseCategoryHref(group.department, category)}
                  className={categoryTagClassName}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <Link
              key={`${tag.department}-${tag.category}`}
              href={browseCategoryHref(tag.department, tag.category)}
              className={categoryTagClassName}
            >
              {tag.category}
            </Link>
          ))}
        </div>
      )}

      {hasHiddenCategories ? (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {showAll ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
