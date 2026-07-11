import { BrowseBrandsExplorer } from "@/components/browse-brands/BrowseBrandsExplorer";
import { SECTION_PY_HOME_REFINE } from "@/components/home/section-spacing";
import type { BrandCard } from "@/lib/member/browse-brands-types";

/** Anchor id for the embedded Discover explorer rendered on the homepage. */
export const HOME_BROWSE_ANCHOR = "browse-brands";

/**
 * Rewrites a standalone Discover-page href (e.g. `/browse-brands?department=Drinks`)
 * into a homepage href that keeps the user on the homepage and scrolls to the
 * embedded explorer, preserving any department/subcategory filters.
 */
export function toHomepageBrowseHref(browseHref: string): string {
  const queryIndex = browseHref.indexOf("?");
  const query = queryIndex >= 0 ? browseHref.slice(queryIndex) : "";
  return `/${query}#${HOME_BROWSE_ANCHOR}`;
}

type HomePartnerBrowseBrandsProps = {
  featured: BrandCard[];
  initialExplore: BrandCard[];
  initialTotal: number;
  canFavorite: boolean;
  favoritedPartnerIds: string[];
  initialDepartment?: string;
  initialSubcategory?: string;
  exploreHeading?: string;
  exploreHeadingClassName?: string;
};

export function HomePartnerBrowseBrands({
  featured,
  initialExplore,
  initialTotal,
  canFavorite,
  favoritedPartnerIds,
  initialDepartment = "",
  initialSubcategory = "",
  exploreHeading,
  exploreHeadingClassName,
}: HomePartnerBrowseBrandsProps) {
  return (
    <section
      id={HOME_BROWSE_ANCHOR}
      className={`scroll-mt-24 bg-[#f3f4f6] ${SECTION_PY_HOME_REFINE}`}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <BrowseBrandsExplorer
          featured={featured}
          initialExplore={initialExplore}
          initialTotal={initialTotal}
          canFavorite={canFavorite}
          favoritedPartnerIds={favoritedPartnerIds}
          initialDepartment={initialDepartment}
          initialSubcategory={initialSubcategory}
          exploreHeading={exploreHeading}
          exploreHeadingClassName={exploreHeadingClassName}
          embedded
        />
      </div>
    </section>
  );
}
