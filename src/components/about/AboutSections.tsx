import Link from "next/link";
import type { ReactNode } from "react";
import {
  HOME_HERO_PY_COMPACT,
  SECTION_PY_HOME_REFINE,
} from "@/components/home/section-spacing";
import {
  IconCompass,
  IconDollarSign,
  IconShoppingBag,
  IconTrendingUp,
} from "@/components/home/home-icons";

const whatIsSteps = [
  {
    title: "Discover Brands",
    description:
      "Explore food, beverage and household brands available through FoodVault.",
    icon: <IconCompass className="h-6 w-6" />,
  },
  {
    title: "Unlock Savings",
    description: "Access exclusive member discounts and offers.",
    icon: <IconDollarSign className="h-6 w-6" />,
  },
  {
    title: "Shop Direct",
    description: "Complete your purchase directly with the brand.",
    icon: <IconShoppingBag className="h-6 w-6" />,
  },
];

const memberBenefits = [
  {
    title: "Save on products you already buy",
    description: "Access exclusive member pricing from participating brands.",
    icon: <IconDollarSign className="h-6 w-6" />,
  },
  {
    title: "Discover new brands",
    description:
      "Find independent food, beverage and household products in one place.",
    icon: <IconCompass className="h-6 w-6" />,
  },
  {
    title: "Shop directly with brands",
    description:
      "Support businesses directly while keeping the relationship between you and the brand.",
    icon: <IconShoppingBag className="h-6 w-6" />,
  },
  {
    title: "One simple membership",
    description: "One membership gives you access to offers across multiple brands.",
    icon: <IconTrendingUp className="h-6 w-6" />,
  },
];

const brandBenefits = [
  "Free partner profile",
  "Direct customer relationships",
  "No marketplace fees",
  "No commission on sales",
  "Customers purchase directly from your website",
];

const values = [
  {
    title: "Better Value",
    description: "Helping members save on products they already love.",
  },
  {
    title: "Supporting Brands",
    description: "Giving independent brands a way to reach more customers.",
  },
  {
    title: "Transparency",
    description: "Clearly explaining how FoodVault works.",
  },
  {
    title: "Simplicity",
    description: "One membership. Multiple brands. Direct shopping.",
  },
];

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function BenefitCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function AboutHero() {
  return (
    <section className="border-b border-border bg-background">
      <div
        className={`mx-auto max-w-[1200px] px-4 text-center sm:px-6 lg:px-8 ${HOME_HERO_PY_COMPACT}`}
      >
        <h1 className="mx-auto max-w-3xl text-[2.625rem] font-bold leading-[1.08] tracking-tight text-foreground sm:text-[2.75rem] lg:text-[3rem]">
          Supporting Kiwi Families and Kiwi Brands
        </h1>
        <div className="mx-auto mt-4 max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>Let&apos;s be honest—everything costs more these days.</p>
          <p>FoodVault was created to make saving a little easier.</p>
          <p>
            We bring together Kiwi brands offering exclusive member pricing, so you can shop
            smarter, spend less, and keep more money for the things that matter most.
          </p>
          <p>
            It&apos;s a simple idea: help Kiwis save money while supporting Kiwi businesses at the
            same time.
          </p>
        </div>
      </div>
    </section>
  );
}

export function AboutWhatIsSection() {
  return (
    <section className={`bg-background ${SECTION_PY_HOME_REFINE}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionHeader title="A simpler way to discover and save" />
        <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            FoodVault helps members discover great brands and access exclusive member
            pricing without marketplace markups or unnecessary complexity.
          </p>
          <p>
            Instead of FoodVault selling products, we connect members directly with
            participating brands. When you find something you love, you purchase directly
            through the brand&apos;s own website.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {whatIsSteps.map((step) => (
            <BenefitCard
              key={step.title}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutMissionSection() {
  return (
    <section
      id="our-story"
      className={`scroll-mt-24 border-y border-border bg-surface ${SECTION_PY_HOME_REFINE}`}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Helping great brands reach more customers" />
        <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Many independent brands create incredible products but struggle to compete
            for attention. FoodVault gives these brands a platform to connect with
            customers who are actively looking for something new.
          </p>
          <p>
            Members get access to better value. Brands get exposure, customer
            relationships and the ability to grow without paying marketplace
            commissions.
          </p>
        </div>
      </div>
    </section>
  );
}

export function AboutMembersSection() {
  return (
    <section className={`bg-background ${SECTION_PY_HOME_REFINE}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Benefits for members" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {memberBenefits.map((benefit) => (
            <BenefitCard
              key={benefit.title}
              title={benefit.title}
              description={benefit.description}
              icon={benefit.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutBrandsSection() {
  return (
    <section className={`border-y border-border bg-surface ${SECTION_PY_HOME_REFINE}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Built to support independent brands"
          description="FoodVault provides brands with a free platform to showcase their products, reach new customers and offer exclusive member pricing."
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:max-w-3xl">
          {brandBenefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-sm text-muted-foreground">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/for-brands"
          className="mt-6 inline-flex items-center justify-center rounded-sm border border-primary bg-transparent px-6 py-3 text-sm font-medium text-primary transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:bg-primary/5"
        >
          Partner With Us
        </Link>
      </div>
    </section>
  );
}

export function AboutValuesSection() {
  return (
    <section className={`bg-background ${SECTION_PY_HOME_REFINE}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionHeader title="What drives FoodVault" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-lg border border-border bg-background p-5 shadow-sm"
            >
              <h3 className="text-sm font-bold text-foreground">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
