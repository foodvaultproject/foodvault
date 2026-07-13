import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { toHomepageBrowseHref } from "@/components/home/HomePartnerBrowseBrands";
import {
  IconBakery,
  IconCoffee,
  IconDrinks,
  IconHoney,
  IconOrganic,
  IconPantry,
  IconPetFood,
  IconProtein,
  IconSnacks,
  IconSupplements,
  IconTrendingChart,
} from "@/components/home/home-icons";

export const TRENDING_SEARCHES: {
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  {
    label: "Protein",
    href: "/browse-brands?department=Health%20%26%20Body&subcategory=Sports%20Nutrition%20%26%20Weight%20Management",
    Icon: IconProtein,
  },
  { label: "Pet Food", href: "/browse-brands?department=Pet", Icon: IconPetFood },
  {
    label: "Coffee",
    href: "/browse-brands?department=Drinks&subcategory=Coffee",
    Icon: IconCoffee,
  },
  {
    label: "Snacks",
    href: "/browse-brands?department=Pantry&subcategory=Snacks%20%26%20Sweets",
    Icon: IconSnacks,
  },
  {
    label: "Supplements",
    href: "/browse-brands?department=Health%20%26%20Body&subcategory=Vitamins%20%26%20Supplements",
    Icon: IconSupplements,
  },
  { label: "Honey", href: "/browse-brands?department=Pantry", Icon: IconHoney },
  {
    label: "Organic",
    href: "/browse-brands?department=Fruit%20%26%20Veg&subcategory=Organic",
    Icon: IconOrganic,
  },
  { label: "Pantry", href: "/browse-brands?department=Pantry", Icon: IconPantry },
  { label: "Drinks", href: "/browse-brands?department=Drinks", Icon: IconDrinks },
  { label: "Bakery", href: "/browse-brands?department=Bakery", Icon: IconBakery },
];

type HomeTrendingSearchesProps = {
  keepBrowseOnHomepage?: boolean;
  hideViewAll?: boolean;
  compact?: boolean;
  className?: string;
};

export function HomeTrendingSearches({
  keepBrowseOnHomepage = false,
  hideViewAll = false,
  compact = false,
  className = "",
}: HomeTrendingSearchesProps) {
  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <IconTrendingChart className="h-4 w-4 text-primary" aria-hidden="true" />
        Trending searches
      </p>
      <div className={`flex flex-wrap gap-2 ${compact ? "mt-2" : "mt-3"}`}>
        {TRENDING_SEARCHES.map(({ label, href, Icon }) => (
          <Link
            key={label}
            href={keepBrowseOnHomepage ? toHomepageBrowseHref(href) : href}
            scroll={!keepBrowseOnHomepage}
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-md"
          >
            <Icon className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
            {label}
          </Link>
        ))}
        {hideViewAll || keepBrowseOnHomepage ? null : (
          <Link
            href="/browse-brands"
            className="inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary-hover"
          >
            View all →
          </Link>
        )}
      </div>
    </div>
  );
}
