import Link from "next/link";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BadgePercent,
  Check,
  CircleDollarSign,
  Compass,
  CreditCard,
  Globe,
  Link2,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { HowItWorksFAQ } from "@/components/how-it-works/HowItWorksFAQ";
import { HowItWorksHeroCollage } from "@/components/how-it-works/HowItWorksHeroCollage";
import {
  IconBakery,
  IconCoffee,
  IconDrinks,
  IconHealth,
  IconHousehold,
  IconOrganic,
  IconPetFood,
  IconProtein,
  IconSnacks,
  IconSupplements,
} from "@/components/home/home-icons";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";
import {
  heading1,
  heading2,
  heading2OnDark,
  heading3,
  heading3OnDark,
} from "@/lib/ui-classes";
import {
  formatMembershipPrice,
  type MembershipSettings,
} from "@/lib/member/pricing";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import type { FAQItem } from "@/data/faq";
import type { ComponentType, ReactNode, SVGProps } from "react";

/* ── Layout tokens ── */
const sectionClass = "bg-page py-[60px]";
const cardClass =
  "fv-card fv-card-hover rounded-lg border border-border bg-background p-6 shadow-card transition-[transform,box-shadow] duration-200";

function IconCircle({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      {children}
    </div>
  );
}

function SectionHeading({
  title,
  description,
  badge,
  align = "center",
}: {
  title: string;
  description?: string;
  badge?: string;
  align?: "center" | "left";
}) {
  const alignClass = align === "center" ? "mx-auto max-w-2xl text-center" : "text-left";

  return (
    <div className={alignClass}>
      {badge ? (
        <span className="fv-badge bg-primary/10 text-primary">{badge}</span>
      ) : null}
      <h2 className={`${heading2} ${badge ? "mt-3" : ""}`}>
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-[13px] leading-relaxed text-muted">{description}</p>
      ) : null}
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

/* ── Data ── */

const heroValueCards = [
  {
    icon: Tag,
    title: "Save Direct",
    description: "Lower member pricing from participating brands.",
  },
  {
    icon: Compass,
    title: "Discover New Brands",
    description: "Find brands you wouldn't normally discover.",
  },
  {
    icon: ArrowUpRight,
    title: "Shop Direct",
    description: "Every purchase happens directly on the brand's website.",
  },
] as const;

const trustBarItems = [
  { icon: BadgePercent, label: "No hidden markups" },
  { icon: Store, label: "Direct from participating brands" },
  { icon: Globe, label: "You always buy on the brand's website" },
  { icon: CreditCard, label: "FoodVault never handles payments" },
] as const;

const memberSteps = [
  {
    number: 1,
    title: "Create your membership",
    description: "Sign up and start your free trial in minutes.",
  },
  {
    number: 2,
    title: "Browse participating brands",
    description: "Explore food, beverage, health and household partners.",
  },
  {
    number: 3,
    title: "View each brand's exclusive member pricing",
    description: "See member-only offers before you shop.",
  },
  {
    number: 4,
    title: "Shop directly with the partner",
    description: "Complete every purchase on the brand's own website.",
  },
] as const;

const whyMembersJoin = [
  {
    icon: Tag,
    title: "Exclusive Member Pricing",
    description: "Access offers not available to the general public.",
  },
  {
    icon: Compass,
    title: "Discover New Brands",
    description: "Find exciting New Zealand brands all in one place.",
  },
  {
    icon: ArrowUpRight,
    title: "Shop Direct",
    description: "Buy directly from the businesses themselves.",
  },
  {
    icon: Wallet,
    title: "One Membership",
    description: "One plan unlocks savings across the whole network.",
  },
] as const;

const whyMembersLove = [
  {
    icon: CircleDollarSign,
    title: "Direct Savings",
    description: "Genuine member pricing on brands you already buy.",
  },
  {
    icon: Wallet,
    title: "One Membership",
    description: "A single membership unlocks discounts across every partner.",
  },
  {
    icon: Sparkles,
    title: "New Discoveries",
    description: "Find independent New Zealand brands worth supporting.",
  },
  {
    icon: ShieldCheck,
    title: "Cancel Anytime",
    description: "No lock-in contracts. Manage or cancel whenever you like.",
  },
] as const;

const memberComparisonRows = [
  { label: "Exclusive member pricing", foodvault: true, traditional: false },
  { label: "Discover new NZ brands", foodvault: true, traditional: false },
  { label: "Shop direct with brands", foodvault: true, traditional: false },
  { label: "One simple membership", foodvault: true, traditional: false },
  { label: "No marketplace markups", foodvault: true, traditional: false },
] as const;

const membersReceive = [
  { icon: Tag, title: "Member Pricing", description: "Exclusive offers from every partner." },
  { icon: Compass, title: "Brand Discovery", description: "Curated directory of NZ brands." },
  { icon: ShoppingBag, title: "Direct Checkout", description: "Always shop on the brand's site." },
  { icon: Sparkles, title: "New Brands Weekly", description: "Fresh partners added regularly." },
  { icon: ShieldCheck, title: "Trusted & Transparent", description: "FoodVault never sells products." },
  { icon: Users, title: "One Account", description: "Manage everything in one place." },
] as const;

const membershipFeatures = [
  "Unlimited brand access",
  "Member pricing",
  "Discover new brands",
  "Manage membership",
] as const;

const browseCategories: {
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { label: "Food", href: "/browse-brands?department=Pantry", Icon: IconSnacks },
  { label: "Beverage", href: "/browse-brands?department=Drinks", Icon: IconDrinks },
  { label: "Household", href: "/browse-brands?department=Household", Icon: IconHousehold },
  { label: "Health", href: "/browse-brands?department=Health%20%26%20Body", Icon: IconHealth },
  { label: "Pet", href: "/browse-brands?department=Pet", Icon: IconPetFood },
  { label: "Baby", href: "/browse-brands?department=Baby", Icon: IconSupplements },
  { label: "Organic", href: "/browse-brands?department=Fruit%20%26%20Veg&subcategory=Organic", Icon: IconOrganic },
  { label: "Snacks", href: "/browse-brands?department=Pantry&subcategory=Snacks%20%26%20Sweets", Icon: IconSnacks },
  { label: "Coffee", href: "/browse-brands?department=Drinks&subcategory=Coffee", Icon: IconCoffee },
  { label: "Tea", href: "/browse-brands?department=Drinks&subcategory=Tea", Icon: IconDrinks },
  { label: "Protein", href: "/browse-brands?department=Health%20%26%20Body&subcategory=Sports%20Nutrition%20%26%20Weight%20Management", Icon: IconProtein },
  { label: "Bakery", href: "/browse-brands?department=Bakery", Icon: IconBakery },
];

const partnerBenefitCards = [
  {
    icon: Users,
    title: "Reach New Customers",
    description: "Get discovered by thousands of engaged NZ shoppers.",
  },
  {
    icon: TrendingUp,
    title: "Drive Traffic",
    description: "Send qualified visitors directly to your website.",
  },
  {
    icon: CircleDollarSign,
    title: "No Listing Fees",
    description: "Join and list your brand at no cost.",
  },
  {
    icon: Settings,
    title: "You Control Everything",
    description: "Manage offers, products and content yourself.",
  },
] as const;

const partnerGridCards = [
  { icon: TrendingUp, title: "More Website Traffic", description: "Drive qualified visitors to your site." },
  { icon: Users, title: "Keep Every Customer", description: "Customers purchase directly from you." },
  { icon: Settings, title: "Full Control", description: "Update offers whenever you like." },
  { icon: Link2, title: "Free Affiliate Program", description: "Launch affiliates without extra software." },
  { icon: CircleDollarSign, title: "Zero Commission", description: "Keep 100% of your product revenue." },
  { icon: Store, title: "One Dashboard", description: "Manage your entire presence in one place." },
] as const;

const partnerSteps = [
  { number: 1, title: "Apply", description: "Submit your brand application." },
  { number: 2, title: "Build Listing", description: "Upload branding, products and offers." },
  { number: 3, title: "Go Live", description: "Become discoverable to FoodVault members." },
  { number: 4, title: "Grow", description: "Increase traffic and acquire new customers." },
] as const;

const partnerComparisonRows = [
  { label: "Free to join", foodvault: true, marketplace: false },
  { label: "No listing fees", foodvault: true, marketplace: false },
  { label: "Zero sales commission", foodvault: true, marketplace: false },
  { label: "You keep every customer", foodvault: true, marketplace: false },
  { label: "Direct website traffic", foodvault: true, marketplace: false },
] as const;

const howItWorksMemberFaqs: FAQItem[] = [
  {
    question: "Does FoodVault sell products?",
    answer:
      "No. FoodVault is a membership platform, not a retailer. We connect members with participating brands and unlock exclusive member pricing. Every purchase is completed directly on the partner's own website.",
  },
  {
    question: "Who processes my order?",
    answer:
      "The participating brand processes your order, payment, shipping and customer support. FoodVault never handles checkout, payments or fulfilment.",
  },
  {
    question: "How does member pricing work?",
    answer:
      "Once you're a member, browse participating brands to view exclusive member offers. When you click through to a partner's site, your member discount is applied automatically at checkout or via a unique member code.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel your FoodVault membership at any time from your account settings. There are no lock-in contracts or hidden fees.",
  },
  {
    question: "Are all discounts the same?",
    answer:
      "No. Each participating brand sets their own member offer. Discounts vary by partner — browse the directory to see what's available from each brand.",
  },
];

const howItWorksPartnerFaqs: FAQItem[] = [
  {
    question: "How do brands join?",
    answer:
      "Apply through the Partner Portal, build your listing with branding and member offers, then go live once approved. The entire process is free with no listing fees or sales commission.",
  },
  {
    question: "Can brands run affiliate programs?",
    answer:
      "Yes. FoodVault includes a built-in affiliate program at no additional cost. Partners can launch and manage affiliates directly from the Partner Dashboard.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Visit our Help Centre or contact the FoodVault support team through the Contact page. We're here to help with membership, partner and platform questions.",
  },
];

/* ── Sections ── */

type HowItWorksPageProps = {
  featuredBrands: BrandCard[];
  settings: MembershipSettings;
  isActiveMember?: boolean;
};

export function HowItWorksPageContent({
  featuredBrands,
  settings,
  isActiveMember = false,
}: HowItWorksPageProps) {
  const formattedPrice = formatMembershipPrice(settings.membershipPriceMonthly);

  return (
    <>
      <HowItWorksHero brands={featuredBrands} isActiveMember={isActiveMember} />
      <HeroValueCardsSection />
      <TrustSentence />
      <HowFoodVaultWorksSection />
      <WhyMembersJoinSection />
      <ComparisonSection />
      <WhyMembersLoveSection />
      <BrowseCategoriesSection />
      <MembershipPricingSection
        formattedPrice={formattedPrice}
        trialDays={settings.trialLengthDays}
        isActiveMember={isActiveMember}
      />
      <PartnerSection />
      <HowItWorksFAQ memberFaqs={howItWorksMemberFaqs} partnerFaqs={howItWorksPartnerFaqs} />
      <FinalCTASection isActiveMember={isActiveMember} />
    </>
  );
}

function HowItWorksHero({
  brands,
  isActiveMember = false,
}: {
  brands: BrandCard[];
  isActiveMember?: boolean;
}) {
  return (
    <section className="border-b border-border bg-background">
      <div className="fv-content-width grid items-center gap-8 py-10 lg:grid-cols-2 lg:gap-12 lg:py-[60px]">
        <div>
          <span className="fv-badge bg-primary/10 text-primary">
            Save More On The Brands You Already Buy
          </span>
          <h1 className={`mt-4 ${heading1}`}>
            Save More On The Brands You Already Buy
          </h1>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-muted">
            FoodVault gives members exclusive pricing from participating New Zealand brands.
            Discover new brands, save money on everyday purchases and shop directly with every
            partner.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            {isActiveMember ? null : (
              <MemberSignupCtaLink
                variant="start-free-trial"
                className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-2.5 text-[14px] font-semibold text-primary-foreground sm:w-auto"
              />
            )}
            <Link
              href={isActiveMember ? "/" : "/browse-brands"}
              className="inline-flex w-full items-center justify-center rounded-sm border border-primary bg-background px-6 py-2.5 text-[14px] font-semibold text-primary transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:bg-primary/5 sm:w-auto"
            >
              Browse Brands
            </Link>
          </div>
        </div>
        <HowItWorksHeroCollage brands={brands} />
      </div>

      <div className="border-t border-border bg-surface">
        <div className="fv-content-width grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {trustBarItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon className="h-[18px] w-[18px] shrink-0 text-primary" strokeWidth={1.75} />
              <span className="text-[12px] font-medium text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroValueCardsSection() {
  return (
    <section className={sectionClass}>
      <div className="fv-content-width grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {heroValueCards.map(({ icon, title, description }) => (
          <FeatureCard key={title} icon={icon} title={title} description={description} />
        ))}
      </div>
    </section>
  );
}

function TrustSentence() {
  return (
    <div className="border-y border-border bg-surface py-4">
      <p className="fv-content-width text-center text-[12px] text-muted">
        FoodVault never sells products. Every purchase is completed directly with participating
        brands.
      </p>
    </div>
  );
}

function HowFoodVaultWorksSection() {
  return (
    <section className={`${sectionClass} bg-background`}>
      <div className="fv-content-width">
        <SectionHeading title="How FoodVault Works" />

        <div className="relative mt-8">
          <div
            className="absolute left-[12%] right-[12%] top-4 hidden h-px bg-border lg:block"
            aria-hidden="true"
          />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
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

        <div className="mt-8 flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 px-5 py-4">
          <ShieldCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" strokeWidth={1.75} />
          <p className="text-[13px] leading-relaxed text-foreground">
            Orders, payments, shipping and customer support are always handled directly by the
            participating brand.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhyMembersJoinSection() {
  return (
    <section className={sectionClass}>
      <div className="fv-content-width">
        <SectionHeading title="Why Members Join FoodVault" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyMembersJoin.map(({ icon, title, description }) => (
            <FeatureCard key={title} icon={icon} title={title} description={description} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className={`${sectionClass} bg-background`}>
      <div className="fv-content-width grid gap-5 lg:grid-cols-2 lg:gap-8">
        <div>
          <h2 className={heading2}>Why It&apos;s Better</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background shadow-card">
            <div className="grid grid-cols-[1fr_auto_auto] border-b border-border bg-surface px-4 py-2.5 text-[12px] font-semibold text-muted">
              <span>Feature</span>
              <span className="w-20 text-center text-primary">FoodVault</span>
              <span className="w-24 text-center">Traditional</span>
            </div>
            {memberComparisonRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1fr_auto_auto] items-center border-b border-border px-4 py-2.5 last:border-b-0"
              >
                <span className="text-[13px] text-foreground">{row.label}</span>
                <span className="flex w-20 justify-center">
                  {row.foodvault ? (
                    <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                  ) : (
                    <X className="h-4 w-4 text-muted-light" strokeWidth={2} />
                  )}
                </span>
                <span className="flex w-24 justify-center">
                  {row.traditional ? (
                    <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                  ) : (
                    <X className="h-4 w-4 text-muted-light" strokeWidth={2} />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className={heading2}>What Members Receive</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {membersReceive.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3">
                <IconCircle>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </IconCircle>
                <div>
                  <h3 className={heading3}>{title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyMembersLoveSection() {
  return (
    <section className={sectionClass}>
      <div className="fv-content-width">
        <SectionHeading title="Why Members Love FoodVault" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyMembersLove.map(({ icon, title, description }) => (
            <FeatureCard key={title} icon={icon} title={title} description={description} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrowseCategoriesSection() {
  return (
    <section className={`${sectionClass} border-y border-border bg-background`}>
      <div className="fv-content-width">
        <SectionHeading
          title="Browse Categories"
          description="Explore member savings across every category."
        />
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {browseCategories.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-[12px] font-medium text-foreground shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-card"
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function MembershipPricingSection({
  formattedPrice,
  trialDays,
  isActiveMember = false,
}: {
  formattedPrice: string;
  trialDays: number;
  isActiveMember?: boolean;
}) {
  return (
    <section className={sectionClass}>
      <div className="fv-content-width">
        <SectionHeading title="Membership Pricing" />
        <div className="mt-8 overflow-hidden rounded-lg border border-border bg-background shadow-card">
          <div className="grid lg:grid-cols-[2fr_3fr]">
            <div className="bg-navy p-6 lg:p-8">
              <h3 className={heading3OnDark}>Simple Membership</h3>
              <ul className="mt-4 space-y-2.5">
                {membershipFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-[13px] text-white/90">
                    <Check className="h-4 w-4 shrink-0 text-white/80" strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>
              {isActiveMember ? null : (
                <MemberSignupCtaLink
                  variant="start-free-trial"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-sm bg-white px-6 py-2.5 text-[14px] font-semibold text-navy transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto"
                />
              )}
            </div>
            <div className="flex flex-col items-center justify-center p-8 text-center lg:p-10">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-primary">
                {trialDays} Day Free Trial
              </p>
              <p className="mt-3">
                <span className="text-[40px] font-bold leading-none text-foreground">
                  {formattedPrice}
                </span>
                <span className="text-[14px] text-muted"> / month</span>
              </p>
              <p className="mt-2 text-[13px] text-muted">Cancel anytime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnerSection() {
  return (
    <>
      <section id="brands" className={`${sectionClass} scroll-mt-24 bg-background`}>
        <div className="fv-content-width">
          <SectionHeading
            badge="For Brands"
            title="Why Brands Partner With FoodVault"
            description="Grow your brand without giving up control."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {partnerBenefitCards.map(({ icon, title, description }) => (
              <FeatureCard key={title} icon={icon} title={title} description={description} />
            ))}
          </div>
          <p className="mt-6 text-center text-[13px] text-muted">
            No listing fees. No sales commissions. You keep every customer.
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              href={PARTNER_CREATE_ACCOUNT_PATH}
              className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-6 py-2.5 text-[14px] font-semibold text-primary-foreground"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </section>

      <section className={`${sectionClass} border-t border-border`}>
        <div className="fv-content-width">
          <SectionHeading title="Grow Your Brand Without Giving Up Control" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partnerGridCards.map(({ icon, title, description }) => (
              <FeatureCard key={title} icon={icon} title={title} description={description} />
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionClass} bg-background`}>
        <div className="fv-content-width grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <SectionHeading title="How Partnering Works" align="left" />
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {partnerSteps.map((step) => (
                <li key={step.number} className={cardClass}>
                  <span className="text-[12px] font-bold text-primary/40">{step.number}</span>
                  <h3 className={`mt-1 ${heading3}`}>{step.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className={heading2}>FoodVault vs Marketplace</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-border shadow-card">
              <div className="grid grid-cols-[1fr_auto_auto] border-b border-border bg-surface px-4 py-2.5 text-[12px] font-semibold text-muted">
                <span>Feature</span>
                <span className="w-20 text-center text-primary">FoodVault</span>
                <span className="w-24 text-center">Marketplace</span>
              </div>
              {partnerComparisonRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1fr_auto_auto] items-center border-b border-border bg-background px-4 py-2.5 last:border-b-0"
                >
                  <span className="text-[13px] text-foreground">{row.label}</span>
                  <span className="flex w-20 justify-center">
                    {row.foodvault ? (
                      <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                    ) : (
                      <X className="h-4 w-4 text-muted-light" strokeWidth={2} />
                    )}
                  </span>
                  <span className="flex w-24 justify-center">
                    {row.marketplace ? (
                      <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                    ) : (
                      <X className="h-4 w-4 text-muted-light" strokeWidth={2} />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FinalCTASection({ isActiveMember = false }: { isActiveMember?: boolean }) {
  return (
    <section className="bg-navy py-[60px]">
      <div className="fv-content-width">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-0">
          <div className="lg:border-r lg:border-white/10 lg:pr-10">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-white/60">
              For Members
            </span>
            <h2 className={`mt-2 ${heading2OnDark}`}>Start Saving With FoodVault</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/70">
              Join thousands of New Zealand shoppers discovering better brands and exclusive member
              pricing.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {isActiveMember ? null : (
                <MemberSignupCtaLink
                  variant="start-free-trial"
                  className="inline-flex w-full items-center justify-center rounded-sm bg-white px-6 py-2.5 text-[14px] font-semibold text-navy transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto"
                />
              )}
              <Link
                href={isActiveMember ? "/" : "/browse-brands"}
                className="inline-flex w-full items-center justify-center rounded-sm border border-white/30 px-6 py-2.5 text-[14px] font-semibold text-white transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
              >
                Browse Brands
              </Link>
            </div>
          </div>

          <div className="lg:pl-10">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-white/60">
              For Brands
            </span>
            <h2 className={`mt-2 ${heading2OnDark}`}>Become a Partner</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/70">
              Reach new customers, drive website traffic and grow direct sales — free to join with
              zero commission.
            </p>
            <Link
              href={PARTNER_CREATE_ACCOUNT_PATH}
              className="fv-btn-primary mt-5 inline-flex w-full items-center justify-center rounded-sm px-6 py-2.5 text-[14px] font-semibold text-primary-foreground sm:w-auto"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Re-export individual sections for backwards compatibility if needed
export {
  HowItWorksHero,
  HeroValueCardsSection as HowItWorksMemberSteps,
  WhyMembersLoveSection,
  PartnerSection as HowItWorksBrandSection,
  FinalCTASection as HowItWorksCTA,
};
