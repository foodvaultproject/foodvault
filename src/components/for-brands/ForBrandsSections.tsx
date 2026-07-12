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
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
  },
  {
    title: "Sell Direct",
    description:
      "Every purchase happens on your own website, allowing you to manage the entire customer experience.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
        />
      </svg>
    ),
  },
  {
    title: "Build Brand Awareness",
    description:
      "Create a professional brand profile showcasing your story, products and imagery.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
        />
      </svg>
    ),
  },
  {
    title: "Promote Exclusive Member Offers",
    description:
      "Encourage new customers to buy directly by offering exclusive member discounts.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
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

const affiliateFeatures = [
  {
    title: "Fans promote freely",
    description:
      "Any of your fans can generate an affiliate link and start promoting your brand—no invitations or approvals required.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
        />
      </svg>
    ),
  },
  {
    title: "Partner dashboard",
    description:
      "Manage your affiliate programme from your FoodVault dashboard with the tools and information you need.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    ),
  },
  {
    title: "Analytics & insights",
    description:
      "View performance analytics and management information so you can see how affiliates are driving results.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
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
              FoodVault helps New Zealand food, beverage, household and health brands connect with
              members actively looking to discover and buy direct. Showcase your brand, promote
              exclusive member offers, and drive customers to your own website—while keeping
              complete control of your products, pricing and customer relationships.
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

export function WhyFoodVaultSection() {
  return (
    <section id="why-foodvault" className="scroll-mt-24 bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className={`text-center ${heading2}`}>Why FoodVault?</h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          <p>FoodVault is a discovery platform—not an online marketplace.</p>
          <p>
            We don&apos;t sell your products, process your orders or take ownership of your
            customers.
          </p>
          <p>
            Instead, we help members discover your brand, then direct them to your own website to
            complete their purchase.
          </p>
          <p>
            That means you maintain complete control of your business while gaining additional
            exposure to highly engaged shoppers.
          </p>
        </div>
      </div>
    </section>
  );
}

export function PartnerBenefitsSection() {
  return (
    <section id="partner-benefits" className="scroll-mt-24 bg-surface py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className={`text-center ${heading2}`}>Partner Benefits</h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {partnerBenefits.map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                {card.icon}
              </div>
              <h3 className={`mt-4 ${heading3}`}>{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
            </div>
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

export function AffiliateProgrammeSection() {
  return (
    <section className="bg-surface py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={heading2}>Affiliate Programme</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Expand your reach with a built-in affiliate programme—without inviting or approving
            affiliates yourself.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Any of your fans can generate a link and start promoting your brand. You manage
            everything from your Partner Dashboard, with analytics and management information to
            track how affiliates are performing.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {affiliateFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-background p-5 text-center sm:p-6"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <h3 className={`mt-4 ${heading3}`}>{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
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
