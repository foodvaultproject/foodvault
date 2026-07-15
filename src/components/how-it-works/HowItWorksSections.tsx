import Image from "next/image";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Compass, Tag, Wallet } from "lucide-react";
import {
  heading2,
  heading2OnDark,
  heading3,
} from "@/lib/ui-classes";
import type { ReactNode } from "react";

const sectionClass = "bg-page py-8 sm:py-10";
const cardClass =
  "fv-card fv-card-hover rounded-lg border border-border bg-background p-5 shadow-card transition-[transform,box-shadow] duration-200 sm:p-6";

function IconCircle({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      {children}
    </div>
  );
}

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

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className={cardClass}>
      <IconCircle>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </IconCircle>
      <h3 className={`mt-4 ${heading3}`}>{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{description}</p>
    </div>
  );
}

const memberSteps = [
  {
    number: 1,
    title: "Create Your Account",
    description: "Sign up in minutes and get started.",
  },
  {
    number: 2,
    title: "Browse Participating Brands",
    description: "Explore food, beverage, household and health brands.",
  },
  {
    number: 3,
    title: "Unlock Member Pricing",
    description: "See exclusive member-only prices before you shop.",
  },
  {
    number: 4,
    title: "Buy Direct and Save",
    description: "Purchase on each brand's website and save.",
  },
] as const;

const whyJoinCards = [
  {
    icon: Tag,
    title: "Save Money",
    description: "Access exclusive member prices on everyday products.",
  },
  {
    icon: ArrowUpRight,
    title: "Shop Direct",
    description: "Purchase directly from participating New Zealand brands.",
  },
  {
    icon: Compass,
    title: "Discover Great Brands",
    description: "Find quality Kiwi brands all in one place.",
  },
  {
    icon: Wallet,
    title: "One Membership",
    description: "One membership gives you access across the platform.",
  },
] as const;

type HowItWorksPageProps = {
  isActiveMember?: boolean;
};

export function HowItWorksPageContent({
  isActiveMember = false,
}: HowItWorksPageProps) {
  return (
    <>
      <HowItWorksHero isActiveMember={isActiveMember} />
      <HowFoodVaultWorksSection />
      <WhyJoinFoodVaultSection />
      <WhyFoodVaultSection />
      <FinalCTASection isActiveMember={isActiveMember} />
    </>
  );
}

function HowItWorksHero({ isActiveMember = false }: { isActiveMember?: boolean }) {
  return (
    <section className="border-b border-primary bg-primary">
      <div className="fv-content-width grid lg:grid-cols-2 lg:items-stretch">
        <div className="flex flex-col justify-center py-8 sm:py-10 lg:py-12">
          <h1 className="text-[2.625rem] font-bold leading-[1.08] tracking-tight text-white sm:text-[2.75rem] lg:text-[3rem]">
            Built to Save Kiwis Money.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/90 sm:text-lg">
            Our mission is simple: to help you spend less on all the things you need. We connect you
            directly with Kiwi brands offering exclusive member pricing, helping you save more every
            time you shop. Food, drinks, household essentials and more! It&apos;s all here on
            FoodVault. Enjoy the things you love, for less.
          </p>
          {isActiveMember ? null : (
            <div className="mt-5">
              <MemberSignupCtaLink
                variant="start-free-trial"
                className="inline-flex w-full items-center justify-center rounded-sm bg-white px-6 py-2.5 text-[14px] font-semibold text-primary transition-colors hover:bg-white/90 sm:w-auto"
              />
            </div>
          )}
        </div>
        <div className="relative min-h-[240px] w-full bg-primary lg:min-h-full">
          <Image
            src="/how-it-works/hero-trolley.png"
            alt="Grocery and household products flowing from a shopping trolley"
            fill
            priority
            className="object-cover object-right mix-blend-screen"
            sizes="(max-width: 1024px) 100vw, 50vw"
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

function WhyJoinFoodVaultSection() {
  return (
    <section className={sectionClass}>
      <div className="fv-content-width">
        <SectionHeading title="Why Join FoodVault" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {whyJoinCards.map(({ icon, title, description }) => (
            <FeatureCard key={title} icon={icon} title={title} description={description} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyFoodVaultSection() {
  return (
    <section className={`${sectionClass} bg-background`}>
      <div className="fv-content-width mx-auto max-w-3xl text-center">
        <h2 className={`text-center ${heading2}`}>Why FoodVault?</h2>
        <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted">
          <p>
            FoodVault was built to help Kiwis save more on the products they already buy.
          </p>
          <p>
            With the cost of living continuing to rise, we&apos;re making it easier to discover New
            Zealand brands offering exclusive member pricing—all in one place.
          </p>
          <p>No gimmicks.</p>
          <p>Just genuine savings from brands that want to sell directly to you.</p>
        </div>
      </div>
    </section>
  );
}

function FinalCTASection({ isActiveMember = false }: { isActiveMember?: boolean }) {
  return (
    <section className="bg-navy py-10 sm:py-12">
      <div className="fv-content-width mx-auto max-w-2xl text-center">
        <h2 className={heading2OnDark}>Ready to Start Saving?</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-white/70">
          Join FoodVault today and start accessing exclusive member pricing from participating New
          Zealand brands.
        </p>
        {isActiveMember ? null : (
          <div className="mt-6">
            <MemberSignupCtaLink
              variant="start-free-trial"
              className="inline-flex w-full items-center justify-center rounded-sm bg-white px-6 py-2.5 text-[14px] font-semibold text-navy transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export { HowItWorksHero, FinalCTASection as HowItWorksCTA };
