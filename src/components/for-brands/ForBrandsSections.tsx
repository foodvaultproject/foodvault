import Link from "next/link";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";
import { heading1, heading2, heading3 } from "@/lib/ui-classes";

const heroBenefits = [
  "No Fees. Ever.",
  "Keep 100% of Every Sale",
  "Customers Buy Directly From Your Website",
  "Full Control of Your Brand & Offers",
];

const partnerBenefits = [
  {
    title: "Reach New Customers",
    description:
      "Put your brand in front of members actively looking for quality New Zealand food, beverage, household and health products.",
    iconSrc: "/for-brands/reach-new-customers.png",
  },
  {
    title: "Sell Direct",
    description:
      "Every purchase happens on your own website, allowing you to manage the entire customer experience.",
    iconSrc: "/for-brands/sell-direct.png",
  },
  {
    title: "Build Brand Awareness",
    description:
      "Create a professional brand profile showcasing your story, products and imagery.",
    iconSrc: "/for-brands/build-brand-awareness.png",
  },
  {
    title: "Promote Exclusive Member Offers",
    description:
      "Encourage new customers to buy directly by offering exclusive member discounts.",
    iconSrc: "/for-brands/promote-exclusive-offers.png",
  },
];

const howItWorksSteps = [
  {
    step: "1",
    title: "Apply",
    description: "Submit your free partner application.",
  },
  {
    step: "2",
    title: "Create Your Brand Profile",
    description:
      "Add your company information, logo, banner, gallery images, products and social links.",
  },
  {
    step: "3",
    title: "Create Your Member Offer",
    description:
      "Choose the products or store-wide discounts you want FoodVault members to receive.",
  },
  {
    step: "4",
    title: "Approval",
    description:
      "Our team reviews your listing and confirms your member offer before your profile goes live.",
  },
  {
    step: "5",
    title: "Start Reaching Members",
    description:
      "Members can discover your brand and purchase directly from your website.",
  },
];

export function ForBrandsHero() {
  return (
    <section className="relative overflow-hidden bg-surface-lavender">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,124,246,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h1 className={heading1}>
              Reach More Kiwi Consumers.{" "}
              <span className="text-primary">It&apos;s Free.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              We help more Kiwi consumers discover your brand and shop directly from your website.
              You keep every sale and stay in control. The best part? It&apos;s completely free!
            </p>

            <div className="mt-6">
              <Link
                href={PARTNER_CREATE_ACCOUNT_PATH}
                className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-8 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
              >
                Become a Partner
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
            <ul className="space-y-4">
              {heroBenefits.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-foreground sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
