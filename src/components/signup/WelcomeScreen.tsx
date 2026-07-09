import Link from "next/link";
import { MEMBER_DASHBOARD_PATH } from "@/lib/auth";

export type WelcomePlan = "trial" | "paid";

const EXPLORE_BRANDS_PATH = "/browse-brands";

type WelcomeContent = {
  heroSupport: string;
  benefitsTitle: string;
  benefits: string[];
  benefitsNote: string;
  bannerBadge: string;
  bannerTitle: string;
  bannerBody: string;
  bottomHeading: string;
};

function getContent(plan: WelcomePlan, trialLengthDays: number): WelcomeContent {
  if (plan === "paid") {
    return {
      heroSupport:
        "Your FoodVault Membership is now active. You now have unlimited access to exclusive member pricing from participating New Zealand brands.",
      benefitsTitle: "Your Membership Includes",
      benefits: [
        "Unlimited access to member pricing",
        "Exclusive partner offers",
        "Unlimited brand browsing",
        "Ongoing access while your membership remains active",
      ],
      benefitsNote:
        "Shop directly with participating brands using your exclusive FoodVault member discount codes.",
      bannerBadge: "★",
      bannerTitle: "You're officially a FoodVault Member",
      bannerBody:
        "Thank you for supporting FoodVault and the growing community of Kiwi brands. Your membership helps us continue adding new partner brands and negotiating more exclusive offers for members.",
      bottomHeading: "Start Saving Today",
    };
  }

  return {
    heroSupport:
      "Your free trial is now active. Start exploring New Zealand brands, unlock exclusive member pricing, and discover new ways to save.",
    benefitsTitle: "Your Free Trial Includes",
    benefits: [
      "Full access to partner brands",
      "All member discount codes",
      "Unlimited brand browsing",
      "Shop directly with participating brands",
    ],
    benefitsNote:
      "FoodVault never sells products directly. When you're ready to purchase, you'll visit the partner's own website and use your exclusive member discount code at checkout.",
    bannerBadge: "★",
    bannerTitle: `Your ${trialLengthDays}-day trial has started`,
    bannerBody:
      "Enjoy full access during your trial. We'll send you reminders before your trial ends so you have plenty of time to decide whether FoodVault is right for you.",
    bottomHeading: "Ready to start saving?",
  };
}

function getGettingStarted(plan: WelcomePlan) {
  return [
    {
      icon: "🔍",
      title: "Browse Partner Brands",
      description:
        "Explore participating New Zealand food, beverage and household brands.",
    },
    {
      icon: "💰",
      title: "Unlock Member Pricing",
      description:
        plan === "paid"
          ? "Every partner listing includes exclusive member-only discount codes available with your membership."
          : "Every partner listing includes exclusive member-only discount codes available throughout your trial.",
    },
    {
      icon: "🛒",
      title: "Shop Directly",
      description:
        "Purchase directly from each partner's own website using your FoodVault member code.",
    },
  ];
}

function ExploreBrandsButton({ className }: { className?: string }) {
  return (
    <Link
      href={EXPLORE_BRANDS_PATH}
      className={`fv-btn-primary inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 ${className ?? ""}`}
    >
      Explore Brands
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </Link>
  );
}

export function WelcomeScreen({
  plan,
  trialLengthDays,
}: {
  plan: WelcomePlan;
  trialLengthDays: number;
}) {
  const content = getContent(plan, trialLengthDays);
  const gettingStarted = getGettingStarted(plan);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 text-center shadow-sm sm:p-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-success-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-success">
          {plan === "paid" ? "Membership Active" : "Free Trial Active"}
        </span>
        <h1 className="mt-5 text-[2.25rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[2.75rem]">
          🎉 Welcome to <span className="text-primary">FoodVault!</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {content.heroSupport}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ExploreBrandsButton className="w-full sm:w-auto" />
          <Link
            href={MEMBER_DASHBOARD_PATH}
            className="inline-flex w-full items-center justify-center rounded-sm border-2 border-primary bg-background px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 sm:w-auto"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Benefits card */}
      <div className="mt-8 rounded-lg border border-border bg-background p-6 text-left shadow-sm sm:p-8">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {content.benefitsTitle}
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {content.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-xs font-bold text-white">
                ✓
              </span>
              <span className="text-sm text-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {content.benefitsNote}
        </p>
      </div>

      {/* Getting started */}
      <div className="mt-8">
        <h2 className="text-center text-xl font-bold tracking-tight text-foreground">
          Getting Started
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {gettingStarted.map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-border bg-background p-6 text-left shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-2xl">
                {card.icon}
              </span>
              <h3 className="mt-4 text-sm font-bold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Status banner */}
      <div className="mt-8 flex items-start gap-4 rounded-lg border border-primary/20 bg-primary/5 p-6 text-left sm:p-8">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg text-primary-foreground">
          {content.bannerBadge}
        </span>
        <div>
          <h3 className="text-base font-bold text-foreground">{content.bannerTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {content.bannerBody}
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 rounded-lg border border-border bg-background p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {content.bottomHeading}
        </h2>
        <div className="mt-5 flex justify-center">
          <ExploreBrandsButton className="w-full sm:w-auto" />
        </div>
      </div>
    </div>
  );
}
