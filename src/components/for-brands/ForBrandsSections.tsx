import Link from "next/link";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";
import { heading1, heading2, heading2OnDark, heading3 } from "@/lib/ui-classes";

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

const finalCtaValues = [
  "No Fees. Ever.",
  "Keep 100% of Every Sale.",
  "Customers Buy Directly From Your Website.",
];

export function ForBrandsHero() {
  return (
    <section className="relative overflow-hidden bg-surface-lavender">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h1 className={heading1}>
              Reach More Kiwi Consumers.{" "}
              <span className="text-primary">It&apos;s Literally Free!</span>
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
    <section id="partner-benefits" className="scroll-mt-24 bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-purple-950 sm:text-3xl">
          Partner Benefits
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {partnerBenefits.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-purple-100/60 bg-primary/5 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-200 hover:shadow-xl sm:p-6"
            >
              <div className="flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
                <img
                  src={card.iconSrc}
                  alt=""
                  aria-hidden="true"
                  width={56}
                  height={56}
                  className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-primary sm:text-base">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
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

export function ForBrandsFinalCTA() {
  return (
    <section className="bg-navy py-10 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className={heading2OnDark}>Ready to Grow Your Brand?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
          Join FoodVault and connect with members actively looking to discover and buy direct from
          New Zealand brands.
        </p>
        <ul className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-2 sm:gap-3">
          {finalCtaValues.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-white/90 sm:text-base">
              <svg
                className="h-4 w-4 shrink-0 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link
            href={PARTNER_CREATE_ACCOUNT_PATH}
            className="inline-flex w-full items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-navy transition-colors hover:bg-white/90 sm:w-auto"
          >
            Become a Partner
          </Link>
        </div>
      </div>
    </section>
  );
}
