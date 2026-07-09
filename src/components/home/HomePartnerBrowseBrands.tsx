import { BrowseBrandsExplorer } from "@/components/browse-brands/BrowseBrandsExplorer";
import { SECTION_PY_HOME_REFINE } from "@/components/home/section-spacing";
import type { BrandCard } from "@/lib/member/browse-brands-types";

type HomePartnerBrowseBrandsProps = {
  featured: BrandCard[];
  initialExplore: BrandCard[];
  initialTotal: number;
  canFavorite: boolean;
  favoritedPartnerIds: string[];
  initialDepartment?: string;
  initialSubcategory?: string;
};

export function HomePartnerBrowseBrands({
  featured,
  initialExplore,
  initialTotal,
  canFavorite,
  favoritedPartnerIds,
  initialDepartment = "",
  initialSubcategory = "",
}: HomePartnerBrowseBrandsProps) {
  return (
    <section className={`bg-[#f3f4f6] ${SECTION_PY_HOME_REFINE}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <BrowseBrandsExplorer
          featured={featured}
          initialExplore={initialExplore}
          initialTotal={initialTotal}
          canFavorite={canFavorite}
          favoritedPartnerIds={favoritedPartnerIds}
          initialDepartment={initialDepartment}
          initialSubcategory={initialSubcategory}
          embedded
        />
      </div>
    </section>
  );
}
