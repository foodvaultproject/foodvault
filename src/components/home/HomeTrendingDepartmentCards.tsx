import Link from "next/link";
import { toHomepageBrowseHref } from "@/components/home/HomePartnerBrowseBrands";

const TRENDING_DEPARTMENT_CARDS = [
  {
    title: "Drinks",
    department: "Drinks",
    imageSrc: "/trending-homepage/drinks-hp.webp",
    imagePositionClassName: "bg-left",
    underlayClassName: "bg-[#ffb8d9]",
  },
  {
    title: "Bakery",
    department: "Bakery",
    imageSrc: "/trending-homepage/bakery-hp.webp",
  },
  {
    title: "Pantry",
    department: "Pantry",
    imageSrc: "/trending-homepage/pantry-hp.webp",
  },
  {
    title: "Beer, Wine & Liquor",
    department: "Beer, Wine & Liquor",
    imageSrc: "/trending-homepage/beer-wine-liquor-hp.webp",
  },
] as const;

const CARD_IMAGE_BASE_CLASS =
  "absolute inset-0 bg-cover bg-no-repeat transition-transform duration-300 group-hover:scale-[1.02]";

type HomeTrendingDepartmentCardsProps = {
  keepBrowseOnHomepage?: boolean;
  className?: string;
};

function departmentBrowseHref(department: string) {
  return `/browse-brands?department=${encodeURIComponent(department)}`;
}

export function HomeTrendingDepartmentCards({
  keepBrowseOnHomepage = false,
  className = "",
}: HomeTrendingDepartmentCardsProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {TRENDING_DEPARTMENT_CARDS.map((card) => {
          const browseHref = departmentBrowseHref(card.department);
          const href = keepBrowseOnHomepage
            ? toHomepageBrowseHref(browseHref)
            : browseHref;
          return (
            <Link
              key={card.department}
              href={href}
              scroll={!keepBrowseOnHomepage}
              className={`group relative block aspect-[4/3] overflow-hidden rounded-lg shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover lg:aspect-[8/3] ${"underlayClassName" in card ? card.underlayClassName : ""}`}
            >
              <div
                aria-hidden="true"
                className={`${CARD_IMAGE_BASE_CLASS} ${"imagePositionClassName" in card ? card.imagePositionClassName : "bg-center"}`}
                style={{ backgroundImage: `url("${card.imageSrc}")` }}
              />
              <div className="absolute left-0 top-0 z-10 p-2 sm:p-2.5">
                <span className="inline-block -skew-x-12 bg-primary px-3 py-1.5 shadow-sm">
                  <span className="inline-block skew-x-12 text-[18px] font-bold leading-none text-primary-foreground">
                    {card.title}
                  </span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
