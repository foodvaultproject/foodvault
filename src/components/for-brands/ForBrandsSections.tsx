import Link from "next/link";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";
import { heading1, heading2, heading2OnDark, heading3, heading3OnDark } from "@/lib/ui-classes";

const FREE_NOTE = "Free to join · No listing fees · 0% commission on your sales";

const valueStrip = [
  "Free to join — no listing fees",
  "More customers & website traffic",
  "More direct sales on your site",
  "Greater brand exposure",
  "Free affiliate program included",
  "Zero commission on your sales",
];

const whyJoinCards = [
  {
    title: "More Website Traffic",
    description:
      "Drive qualified shoppers directly to your own online store — at no cost to you. No checkout on FoodVault; every click belongs to your business.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: "Own Every Customer",
    description:
      "Customers purchase directly from your website. You own the customer relationship, customer data and future marketing opportunities.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: "Complete Control",
    description:
      "Update member offers, brand information, images, products and featured promotions free from your Partner Dashboard. No waiting for approvals.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    title: "Free Affiliate Program",
    description:
      "Turn your customers, creators and influencers into sales partners. FoodVault provides a complete affiliate platform with referral tracking, commission management and automated payouts. No additional software required.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    title: "Increase Brand Discovery",
    description:
      "List for free and become visible to thousands of members who discover new brands through FoodVault every month.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    title: "Zero Commission on Sales",
    description:
      "FoodVault never takes a percentage of your product sales. Every sale is completed on your own website. You keep 100% of your revenue.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M3.75 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.375M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
];

const marketplaceCons = [
  "Marketplace owns the customer",
  "High commissions and listing fees",
  "Checkout happens on their platform",
  "Limited control over branding",
  "Compete against hundreds of similar products",
  "Little long-term customer ownership",
];

const foodvaultPros = [
  "Free to join — you own the customer",
  "0% commission on product sales",
  "Customers buy from your website",
  "Complete control over your brand",
  "Free affiliate program included",
  "Build your own long-term customer base",
];

const dashboardTools = [
  { label: "Business Profile", icon: "M2.25 21h19.5M2.25 9h19.5M2.25 15h19.5" },
  { label: "Brand Images", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l3.682 3.682m0-.032l-4.438-4.438a2.25 2.25 0 00-3.182 0l-3.182 3.182M6.75 6.75h.008v.008H6.75V6.75z" },
  { label: "Member Offers", icon: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" },
  { label: "Selected Products", icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },
  { label: "Affiliate Program", icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" },
  { label: "Social Media", icon: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z" },
  { label: "Analytics", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
  { label: "Support", icon: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" },
];

const affiliateBenefits = [
  "Enable or disable your affiliate program at any time",
  "Set your own commission rate",
  "Allow anyone to become an affiliate",
  "Track affiliate sales and view commissions",
  "Approve payouts automatically",
  "Grow through creators, bloggers and influencers",
];

const journeySteps = [
  {
    step: "01",
    title: "Apply",
    description:
      "Complete your free Brand Application with your business details and member offer — no fees to apply.",
  },
  {
    step: "02",
    title: "Get Approved",
    description:
      "Our team reviews your application at no cost to ensure it meets FoodVault's quality standards.",
  },
  {
    step: "03",
    title: "Build Your Listing",
    description:
      "Upload your branding, offers, products and affiliate settings free from your Partner Dashboard.",
  },
  {
    step: "04",
    title: "Go Live",
    description:
      "Start receiving member traffic, direct website visitors and affiliate-driven sales — still free, still 0% commission.",
  },
];

const dashboardPreviewModules = [
  "Member Offers",
  "Website Traffic",
  "Affiliate Program",
  "Affiliate Sales",
  "Brand Listing",
  "Selected Products",
  "Social Media",
  "Analytics",
];

function SectionFreeNote({ onDark = false }: { onDark?: boolean }) {
  return (
    <p
      className={`mt-4 inline-flex rounded-full px-4 py-1.5 text-xs font-semibold sm:text-sm ${
        onDark ? "bg-white/15 text-white" : "bg-success-light text-success"
      }`}
    >
      {FREE_NOTE}
    </p>
  );
}

function SectionHeader({
  badge,
  title,
  description,
  align = "center",
  showFreeNote = true,
}: {
  badge?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  showFreeNote?: boolean;
}) {
  const alignClass = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";

  return (
    <div className={alignClass}>
      {badge ? (
        <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
          {badge}
        </span>
      ) : null}
      <h2 className={`${heading2} ${badge ? "mt-4" : ""}`}>
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
      {showFreeNote ? (
        <div className={align === "center" ? "flex justify-center" : ""}>
          <SectionFreeNote />
        </div>
      ) : null}
    </div>
  );
}

function CheckIcon({ positive }: { positive: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
        positive ? "bg-success-light text-success" : "bg-surface text-muted-foreground"
      }`}
    >
      {positive ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </span>
  );
}

export function ForBrandsHero() {
  return (
    <section className="relative overflow-hidden bg-surface-lavender">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex rounded-full bg-success-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-success">
              Free for New Zealand Brands
            </span>
            <h1 className={`mt-6 ${heading1}`}>
              Grow Your Brand.{" "}
              <span className="text-primary">Keep Every Customer.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              FoodVault helps New Zealand brands attract new customers, increase direct website
              traffic and grow sales — free to join, with no listing fees and no commission on
              your product sales.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Unlike traditional marketplaces, customers always purchase directly from your website.
              You own the customer relationship, control every offer, and pay{" "}
              <strong className="font-semibold text-foreground">0% commission on your sales</strong>.
            </p>

            <SectionFreeNote />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={PARTNER_CREATE_ACCOUNT_PATH}
                className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-8 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
              >
                Become a Partner
              </Link>
              <Link
                href="#why-join"
                className="inline-flex w-full items-center justify-center rounded-sm border-2 border-primary bg-transparent px-8 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary/5 sm:w-auto"
              >
                Browse Partner Benefits
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Why retailers choose FoodVault
            </p>
            <ul className="mt-6 space-y-4">
              {valueStrip.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-foreground sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-lg bg-navy p-5 text-white">
              <p className="text-sm font-semibold">Free to join. Zero commission.</p>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                A high-value marketing channel — not a marketplace that charges listing fees, takes
                your customers or cuts your margin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyBrandsJoinSection() {
  return (
    <section id="why-join" className="scroll-mt-24 bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Partner Benefits"
          title="Why Brands Join FoodVault"
          description="Real reasons New Zealand retailers use FoodVault to grow direct-to-consumer sales — free to join, with no listing fees and no commission on your sales."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {whyJoinCards.map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                {card.icon}
              </div>
              <h3 className={`mt-5 ${heading3}`}>{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyFoodVaultIsDifferentSection() {
  return (
    <section className="bg-surface py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Why FoodVault Is Different"
          description="Traditional marketplaces charge fees and take your customers. FoodVault is free for brands and built for direct-to-consumer growth."
        />

        <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-2 md:gap-8">
          <div className="rounded-lg border border-border bg-background p-6 sm:p-8">
            <h3 className={heading3}>
              Traditional Marketplace
            </h3>
            <ul className="mt-6 space-y-4">
              {marketplaceCons.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-muted-foreground sm:text-base">
                  <CheckIcon positive={false} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-primary p-6 shadow-lg sm:p-8 md:-mt-1 md:mb-1">
            <h3 className={heading3OnDark}>FoodVault</h3>
            <ul className="mt-6 space-y-4">
              {foodvaultPros.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-white/90 sm:text-base">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EverythingYouManageSection() {
  return (
    <section id="dashboard-tools" className="scroll-mt-24 bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Everything You Can Manage"
          description="Partners control everything themselves — free from one simple Partner Dashboard. No listing fees, no commission on your sales."
        />

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-14 lg:grid-cols-4">
          {dashboardTools.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface/50 p-5 shadow-sm transition-colors hover:border-primary/30 hover:bg-background"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </span>
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FreeAffiliateProgramSection() {
  return (
    <section className="bg-surface-lavender py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeader
              badge="Built In · Free"
              title="Launch Your Own Affiliate Program — Free"
              description="Most affiliate platforms charge monthly fees, setup costs or commissions. FoodVault includes a fully integrated affiliate program at no additional cost."
              align="left"
            />
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              FoodVault manages the tracking, reporting and payouts while customers still purchase
              directly from your website. You gain a powerful new sales channel without adding
              another tool to your stack.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Partners can
            </p>
            <ul className="mt-6 space-y-4">
              {affiliateBenefits.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-foreground sm:text-base">
                  <CheckIcon positive />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PartnerJourneySection() {
  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Getting Started Is Simple"
          description="Apply, get approved and go live — the entire partner journey is free, with no setup fees or commission on your product sales."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {journeySteps.map((step) => (
            <div
              key={step.title}
              className="relative rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8"
            >
              <span className="text-3xl font-bold text-primary/20">{step.step}</span>
              <h3 className={`mt-4 ${heading3}`}>{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DashboardPreviewSection() {
  return (
    <section className="bg-surface py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Your Partner Dashboard"
          description="A free preview of the tools available to every FoodVault partner — manage your brand, offers and affiliates in one place at no cost."
        />

        <div className="mt-10 overflow-hidden rounded-lg border border-border bg-background shadow-lg md:mt-14">
          <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs font-medium text-muted-foreground">
              Partner Dashboard
            </span>
          </div>

          <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="hidden border-r border-border bg-surface/60 p-4 lg:block">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Navigation
              </p>
              <ul className="mt-4 space-y-2">
                {["Overview", "My Listing", "Member Offers", "Affiliate Program", "Analytics"].map(
                  (item, index) => (
                    <li
                      key={item}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        index === 0
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            </aside>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboardPreviewModules.map((module) => (
                  <div
                    key={module}
                    className="rounded-lg border border-dashed border-border bg-surface/40 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary/40" />
                      <p className="text-sm font-semibold text-foreground">{module}</p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 w-full rounded bg-border/80" />
                      <div className="h-2 w-4/5 rounded bg-border/60" />
                      <div className="h-2 w-3/5 rounded bg-border/40" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-xs text-muted-foreground sm:text-sm">
                Illustrative preview only — your dashboard shows your real brand data and tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyItsFreeSection() {
  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-surface-lavender p-8 text-center sm:p-12">
          <SectionHeader
            title="Why is FoodVault free for brands?"
            description="FoodVault succeeds when more brands participate, giving members more choice and helping create a stronger marketplace."
            showFreeNote={false}
          />
          <ul className="mx-auto mt-8 max-w-xl space-y-3 text-left sm:mt-10">
            {[
              "No setup fees.",
              "No monthly listing fees.",
              "No commission on your product sales.",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm text-foreground sm:text-base">
                <CheckIcon positive />
                {item}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            You remain in complete control of your business while FoodVault helps bring new
            customers to your website.
          </p>
        </div>
      </div>
    </section>
  );
}

export function ForBrandsFinalCTA() {
  return (
    <section className="bg-navy py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <SectionFreeNote onDark />
        <h2 className={`mt-6 ${heading2OnDark}`}>
          Ready to Reach More Customers?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
          Join FoodVault and start attracting new customers, increasing direct website traffic,
          launching your own affiliate program and growing your brand — all from a single platform.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
          Join free today — no listing fees, no commission on product sales and no long-term
          contracts.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={PARTNER_CREATE_ACCOUNT_PATH}
            className="inline-flex w-full items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-navy transition-colors hover:bg-white/90 sm:w-auto"
          >
            Become a Partner
          </Link>
          <Link
            href="#why-join"
            className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            View Partner Benefits
          </Link>
        </div>
      </div>
    </section>
  );
}
