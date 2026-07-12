import { BrandLogoCarousel } from "@/components/home/BrandLogoCarousel";
import { heading2 } from "@/lib/ui-classes";
import type { PartnerLogoItem } from "@/lib/member/browse-brands";

type ForBrandsPartnerLogosSectionProps = {
  logos: PartnerLogoItem[];
};

function EmptyLogoPlaceholder() {
  return (
    <div className="flex items-center justify-center gap-8 py-6" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <span
          key={index}
          className="h-[5.2rem] w-[5.2rem] shrink-0 rounded-full border border-border bg-surface"
        />
      ))}
    </div>
  );
}

export function ForBrandsPartnerLogosSection({ logos }: ForBrandsPartnerLogosSectionProps) {
  return (
    <section className="bg-background py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className={`text-center ${heading2}`}>
          Join Kiwi Brands Already Growing with FoodVault!
        </h2>
      </div>

      <div className="mt-5">
        {logos.length > 0 ? <BrandLogoCarousel logos={logos} /> : <EmptyLogoPlaceholder />}
      </div>
    </section>
  );
}
