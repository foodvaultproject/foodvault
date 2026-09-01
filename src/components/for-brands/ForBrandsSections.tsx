import Link from "next/link";
import { PARTNER_CREATE_ACCOUNT_PATH, PARTNER_LOGIN_PATH } from "@/lib/partner-auth";
import { heading1, heading2, heading3 } from "@/lib/ui-classes";

const partnerBenefits = [
  {
    title: "Reach New Customers",
    description:
      "Put your business in front of members actively looking for quality Kiwi products, local dining, and hidden gems.",
    iconSrc: "/for-brands/reach-new-customers.png",
  },
  {
    title: "Direct Sales & Visits",
    description:
      "Send customers directly to your website to buy, or bring hungry locals straight through your front door.",
    iconSrc: "/for-brands/sell-direct.png",
  },
  {
    title: "Build Awareness",
    description:
      "Showcase your story, photos, opening hours, menu highlights, or product range with a slick profile.",
    iconSrc: "/for-brands/build-brand-awareness.png",
  },
  {
    title: "Promote Member Perks",
    description:
      "Attract repeat customers by offering exclusive online discounts or in-store member perks.",
    iconSrc: "/for-brands/promote-exclusive-offers.png",
  },
];

const howItWorksSteps = [
  {
    step: "1",
    title: "Apply",
    description: "Submit your free partner application in minutes.",
  },
  {
    step: "2",
    title: "Create Your Profile",
    description: "Add your logo, photos, address or website, and business details.",
  },
  {
    step: "3",
    title: "Set Your Perk",
    description: "Choose an online promo code or an in-store counter offer for members.",
  },
  {
    step: "4",
    title: "Fast Approval",
    description: "Our team reviews and approves your listing within 24 hours.",
  },
  {
    step: "5",
    title: "Start Growing",
    description: "Gain instant exposure to active FoodVault members nationwide.",
  },
];

const FOR_BRANDS_HERO_IMAGE = "/for-brands/for-brands-hero.png?v=2";

export function ForBrandsHero() {
  return (
    <section className="relative overflow-hidden bg-surface-lavender">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,124,246,0.08),transparent_50%)]" />
      <img
        src={FOR_BRANDS_HERO_IMAGE}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 hidden h-full w-auto max-w-none md:block"
        decoding="async"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="max-w-xl">
          <h1 className={heading1}>
            Reach More Kiwi Customers.{" "}
            <span className="text-primary">It&apos;s Free.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We help Kiwi consumers discover your business—whether you sell online or run a local
            cafe, restaurant, or eatery. Keep 100% of your sales with zero fees.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={PARTNER_CREATE_ACCOUNT_PATH}
              className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-8 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
            >
              Become a Partner
            </Link>
            <Link
              href={PARTNER_LOGIN_PATH}
              className="inline-flex w-full items-center justify-center rounded-sm border-2 border-primary bg-background px-8 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary/5 sm:w-auto"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
      <div className="relative md:hidden">
        <img
          src={FOR_BRANDS_HERO_IMAGE}
          alt="Kiwi brand products and local food"
          className="h-auto w-full object-contain object-right"
          decoding="async"
        />
      </div>
    </section>
  );
}

export function PartnerBenefitsSection() {
  return (
    <section id="partner-benefits" className="scroll-mt-24 bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Partner Benefits
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partnerBenefits.map((card) => (
            <article
              key={card.title}
              className="flex min-h-[9.5rem] overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-card sm:min-h-[10.5rem]"
            >
              <div className="flex w-1/2 shrink-0 items-center justify-center bg-[#F5F2FF] p-2 sm:p-3">
                <img
                  src={card.iconSrc}
                  alt=""
                  aria-hidden="true"
                  width={120}
                  height={120}
                  className="h-full max-h-24 w-full object-contain sm:max-h-28"
                />
              </div>
              <div className="flex w-1/2 flex-col justify-center bg-white px-2.5 py-3 sm:px-3 sm:py-4">
                <h3 className="text-xs font-bold leading-snug text-primary sm:text-sm">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground sm:mt-2 sm:text-xs">
                  {card.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className={`text-center ${heading2}`}>How It Works</h2>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {howItWorksSteps.map((step) => (
            <div
              key={step.title}
              className="relative rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6"
            >
              <span className="text-2xl font-bold text-primary/20">{step.step}</span>
              <h3 className={`mt-3 ${heading3}`}>{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
