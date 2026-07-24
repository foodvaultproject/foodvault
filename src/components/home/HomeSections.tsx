import Link from "next/link";
import { toHomepageBrowseHref } from "@/components/home/HomePartnerBrowseBrands";
import { testimonials } from "@/data/homepage";
import {
  HOME_SECTION_PY,
  HOME_STRIP_PY,
  SECTION_PY_HOME,
  SECTION_PY_HOME_REFINE,
  SECTION_PY_HOME_PARTNER,
} from "@/components/home/section-spacing";
import {
  IconBakery,
  IconCoffee,
  IconCompass,
  IconDollarSign,
  IconDrinks,
  IconHealth,
  IconHousehold,
  IconMore,
  IconPersonalCare,
  IconPetFood,
  IconProtein,
  IconShoppingBag,
  IconSupplements,
  IconTrendingUp,
  IconUser,
} from "@/components/home/home-icons";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";
import type { ComponentType, ReactNode, SVGProps } from "react";

export function HomeBrandBanner() {
  return (
    <div className={`bg-primary ${HOME_STRIP_PY}`}>
      <p className="px-4 text-center text-base font-semibold text-primary-foreground sm:text-lg">
        Save with your favourite New Zealand food brands.
      </p>
    </div>
  );
}

const whyJoinFeatures = [
  {
    title: "Exclusive Member Savings",
    description: "Unlock exclusive discounts from Kiwi brands.",
    iconSrc: "/home/why-join-savings.png",
  },
  {
    title: "Discover Awesome Kiwi Brands",
    description:
      "Find your next favourite, from well-known brands to hidden gems.",
    iconSrc: "/home/why-join-kiwi.png",
  },
  {
    title: "Shop Direct",
    description: "Shop directly on each brand's website with confidence.",
    iconSrc: "/home/why-join-direct.png",
  },
  {
    title: "More Brands. More Savings.",
    description: "New brands join regularly, giving you more ways to save.",
    iconSrc: "/home/why-join-scale.png",
  },
];

export function HomeWhyJoinFeatures({ compactSpacing = false }: { compactSpacing?: boolean }) {
  return (
    <section
      className={`bg-background ${
        compactSpacing ? SECTION_PY_HOME_PARTNER : SECTION_PY_HOME_REFINE
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className={compactSpacing ? "mb-2.5" : "mb-5"}>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Why Join FoodVault</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Save more. Discover more. Shop smarter.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyJoinFeatures.map((feature) => (
            <article
              key={feature.title}
              className="flex min-h-[9.5rem] overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-card sm:min-h-[10.5rem]"
            >
              <div className="flex w-1/2 shrink-0 items-center justify-center bg-[#F5F2FF] p-2 sm:p-3">
                <img
                  src={feature.iconSrc}
                  alt=""
                  aria-hidden="true"
                  width={120}
                  height={120}
                  className="h-full max-h-24 w-full object-contain sm:max-h-28"
                />
              </div>
              <div className="flex w-1/2 flex-col justify-center bg-white px-2.5 py-3 sm:px-3 sm:py-4">
                <h3 className="text-xs font-bold leading-snug text-primary sm:text-sm">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground sm:mt-2 sm:text-xs">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const partnerQuickLinks: {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: ReactNode;
}[] = [
  {
    title: "Manage Your Listing",
    description:
      "Update your brand profile, member offers and product listings to keep your presence fresh.",
    href: "/partner/listing",
    cta: "Manage listing",
    icon: <IconShoppingBag className="h-11 w-11" />,
  },
  {
    title: "Affiliate Program",
    description:
      "Partner with affiliates to extend your reach and drive more traffic to your brand.",
    href: "/partner/affiliate-program",
    cta: "View program",
    icon: <IconTrendingUp className="h-11 w-11" />,
  },
  {
    title: "My Account",
    description: "Manage your Account details here.",
    href: "/partner/account",
    cta: "Open account",
    icon: <IconUser className="h-11 w-11" />,
  },
  {
    title: "Partner Support",
    description:
      "Questions about growing on FoodVault? The partner team is here to help.",
    href: "/partner/support",
    cta: "Get support",
    icon: <IconCompass className="h-11 w-11" />,
  },
];

export function HomePartnerQuickLinks({ compactSpacing = false }: { compactSpacing?: boolean }) {
  return (
    <section
      className={`bg-background ${
        compactSpacing ? SECTION_PY_HOME_PARTNER : SECTION_PY_HOME_REFINE
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className={compactSpacing ? "mb-2.5" : "mb-5"}>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Manage Your FoodVault Presence
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you need to grow your brand and reach members across New Zealand.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partnerQuickLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex flex-col rounded-lg border border-border bg-background p-5 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                {item.icon}
              </div>
              <h3 className="mt-4 text-sm font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <span className="mt-3 text-xs font-semibold text-primary transition-colors group-hover:text-primary-hover">
                {item.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const shopCategories: {
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  {
    label: "Protein",
    href: "/browse-brands?department=Health%20%26%20Body&subcategory=Sports%20Nutrition%20%26%20Weight%20Management",
    Icon: IconProtein,
  },
  { label: "Pet Food", href: "/browse-brands?department=Pet", Icon: IconPetFood },
  {
    label: "Coffee",
    href: "/browse-brands?department=Drinks&subcategory=Coffee",
    Icon: IconCoffee,
  },
  { label: "Health", href: "/browse-brands?department=Health%20%26%20Body", Icon: IconHealth },
  { label: "Drinks", href: "/browse-brands?department=Drinks", Icon: IconDrinks },
  { label: "Bakery", href: "/browse-brands?department=Bakery", Icon: IconBakery },
  { label: "Household", href: "/browse-brands?department=Household", Icon: IconHousehold },
  {
    label: "Supplements",
    href: "/browse-brands?department=Health%20%26%20Body&subcategory=Vitamins%20%26%20Supplements",
    Icon: IconSupplements,
  },
  {
    label: "Personal Care",
    href: "/browse-brands?department=Health%20%26%20Body",
    Icon: IconPersonalCare,
  },
  { label: "More", href: "/browse-brands", Icon: IconMore },
];

export function HomeCategories({
  onHomepage = false,
  compactSpacing = false,
}: {
  onHomepage?: boolean;
  compactSpacing?: boolean;
}) {
  return (
    <section
      className={`border-y border-border bg-background ${
        compactSpacing ? SECTION_PY_HOME_PARTNER : SECTION_PY_HOME_REFINE
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 lg:grid lg:grid-cols-10 lg:gap-2 lg:overflow-visible lg:snap-none">
          {shopCategories.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={onHomepage ? toHomepageBrowseHref(href) : href}
              scroll={!onHomepage}
              className="group flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-2 transition-transform duration-200 hover:-translate-y-0.5 lg:w-auto"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm transition-all duration-200 group-hover:border-primary group-hover:bg-primary/5 group-hover:shadow-md">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-center text-xs font-medium leading-tight text-foreground">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const experienceCards = [
  {
    title: "Real Savings",
    description: "Genuine member pricing on brands you already know and love.",
    emoji: "💵",
  },
  {
    title: "Discover Brands",
    description: "Find independent New Zealand brands worth supporting.",
    emoji: "✨",
  },
  {
    title: "Shop Direct",
    description: "Buy on each brand's own website — FoodVault is never the checkout.",
    emoji: "🔗",
  },
  {
    title: "One Membership",
    description: "A single membership unlocks discounts across the whole network.",
    emoji: "🔓",
  },
];

export function HomeMemberExperience() {
  return (
    <section className={`bg-navy ${HOME_SECTION_PY}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The Member Savings Experience
          </h2>
          <p className="mt-4 text-lg text-white/70">
            A smarter way to save on the products you buy every week.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {experienceCards.map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-white/10 bg-white/5 p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-2xl">
                {card.emoji}
              </div>
              <h3 className="mt-4 font-bold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeTestimonials() {
  return (
    <section className={`bg-surface-lavender ${HOME_SECTION_PY}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Community Feedback
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Thousands of New Zealand shoppers are already saving with FoodVault.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex flex-col rounded-lg border border-border bg-background p-6 shadow-sm"
            >
              <div className="text-primary" aria-hidden="true">
                {"★★★★★"}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-foreground">
                {testimonial.name}
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {testimonial.location}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePartnerBanner() {
  const partnerFeatures = [
    {
      label: "Reach more customers",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Increase sales",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: "It's free to join",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className={`bg-background ${SECTION_PY_HOME}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg bg-navy shadow-card">
          <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-10 lg:p-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Are you a New Zealand brand?
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
                Join FoodVault free of charge and connect directly with members looking
                to save. List your business, create an exclusive member offer and drive
                traffic directly to your own website.
              </p>
              <Link
                href={PARTNER_CREATE_ACCOUNT_PATH}
                className="mt-6 fv-btn-primary inline-flex items-center justify-center rounded-sm px-6 py-3 text-sm font-medium text-primary-foreground transition-[transform,box-shadow] duration-150"
              >
                Partner with us
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {partnerFeatures.map((feature) => (
                <div
                  key={feature.label}
                  className="flex flex-col items-center rounded-lg border border-white/10 bg-white/5 px-2 py-3 text-center sm:px-3 sm:py-4"
                >
                  <span className="text-white/80">{feature.icon}</span>
                  <p className="mt-2 text-[10px] font-medium leading-tight text-white/80 sm:text-xs">
                    {feature.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
