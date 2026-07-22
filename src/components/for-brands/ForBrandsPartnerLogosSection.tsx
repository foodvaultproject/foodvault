import { BrandLogoCarousel } from "@/components/home/BrandLogoCarousel";
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
      {logos.length > 0 ? <BrandLogoCarousel logos={logos} /> : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EmptyLogoPlaceholder />
        </div>
      )}
    </section>
  );
}
