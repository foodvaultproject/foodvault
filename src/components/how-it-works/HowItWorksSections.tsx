import { HowItWorksHeroSignupCta } from "@/components/how-it-works/HowItWorksHeroSignupCta";
import { HomeWhyJoinFeatures } from "@/components/home/HomeSections";
import {
  heading2,
  heading3,
} from "@/lib/ui-classes";

const sectionClass = "bg-page py-8 sm:py-10";

function SectionHeading({
  title,
  align = "center",
}: {
  title: string;
  align?: "center" | "left";
}) {
  const alignClass = align === "center" ? "mx-auto max-w-2xl text-center" : "text-left";

  return (
    <div className={alignClass}>
      <h2 className={`${heading2} ${align === "center" ? "text-center" : ""}`.trim()}>{title}</h2>
    </div>
  );
}

const memberSteps = [
  {
    number: 1,
    title: "Create Your Account",
    description: "Sign up in seconds to start unlocking exclusive member savings.",
  },
  {
    number: 2,
    title: "Browse Brands & Venues",
    description:
      "Explore online food & beverage brands or discover local cafes, bakeries, and eateries near you.",
  },
  {
    number: 3,
    title: "Unlock Member Perks",
    description:
      "Get unique online promo codes or open your live digital membership screen on your phone.",
  },
  {
    number: 4,
    title: "Save Online or In-Store",
    description:
      "Redeem codes at web checkout or show your live membership at the counter to save instantly.",
  },
] as const;

const HOW_IT_WORKS_HERO_BACKGROUND = "/how-it-works/how-it-works-hero-bg.webp";
const HOW_IT_WORKS_HERO_IMAGE = "/how-it-works/how-it-works-hero-image.webp";

type HowItWorksPageProps = {
  isActiveMember?: boolean;
};

export function HowItWorksPageContent(_props: HowItWorksPageProps = {}) {
  return (
    <>
      <HowItWorksHero />
      <HowFoodVaultWorksSection />
      <HomeWhyJoinFeatures mobileTwoColumn />
    </>
  );
}

function HowItWorksHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${HOW_IT_WORKS_HERO_BACKGROUND}')` }}
        aria-hidden="true"
      />
      <div className="relative z-10 fv-content-width grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,46%)] lg:items-stretch">
        <div className="flex flex-col justify-center py-8 sm:py-10 lg:py-12">
          <h1 className="text-[2.625rem] font-bold leading-[1.08] tracking-tight text-primary sm:text-[2.75rem] lg:text-[3rem]">
            Built to Save Kiwis Money.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-black sm:text-lg">
            Unlock exclusive member perks from top Kiwi brands and local venues across New Zealand.
            Save online at checkout or show your membership at the counter for instant discounts at
            cafes, restaurants, and eateries.
          </p>
          <HowItWorksHeroSignupCta />
        </div>

        <div className="relative m-0 flex min-h-0 items-end justify-center self-stretch p-0 leading-[0] lg:justify-end">
          <img
            src={HOW_IT_WORKS_HERO_IMAGE}
            alt=""
            aria-hidden="true"
            className="block h-auto w-full max-w-full object-contain object-bottom px-4 pb-0 pt-2 sm:px-6 lg:h-full lg:max-h-full lg:w-auto lg:px-0 lg:pt-0 lg:object-contain lg:object-right-bottom"
          />
        </div>
      </div>
    </section>
  );
}

function HowFoodVaultWorksSection() {
  return (
    <section className={`${sectionClass} bg-background`}>
      <div className="fv-content-width">
        <SectionHeading title="How FoodVault Works" />

        <div className="relative mt-6">
          <div
            className="absolute left-[12%] right-[12%] top-4 hidden h-px bg-border lg:block"
            aria-hidden="true"
          />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {memberSteps.map((step) => (
              <li key={step.number} className="relative text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className={`mt-3 ${heading3}`}>{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export { HowItWorksHero };
