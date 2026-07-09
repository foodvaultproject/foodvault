import Link from "next/link";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";

export function ContactHero() {
  return (
    <section className="bg-gradient-to-b from-surface-lavender via-background to-background pt-7 sm:pt-10 md:pt-12">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          How Can We Help?
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
          Whether you&apos;re a member looking for savings, a brand interested in
          the vault, or just have a general question, our team is ready to
          assist.
        </p>
      </div>
    </section>
  );
}

export function ContactAlert() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <div>
          <h2 className="font-bold text-foreground">Before You Contact Us</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            FoodVault is a membership and discovery platform, not a direct
            retailer. We do not manufacture or sell products directly. For
            questions regarding{" "}
            <strong className="font-semibold text-foreground">
              specific orders, shipping status, product quality, returns, or
              refunds
            </strong>
            , please contact the partner business where you made the purchase.
            You can find their contact details on your order confirmation email.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContactSidebar() {
  return (
    <aside className="space-y-6">
      <div className="relative overflow-hidden rounded-lg bg-navy p-6 text-white sm:p-8">
        <span className="inline-flex rounded-full bg-success px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          For Brands
        </span>
        <h2 className="mt-4 max-w-[85%] text-xl font-bold leading-tight sm:text-2xl">
          Grow Your Brand with FoodVault
        </h2>
        <p className="mt-3 max-w-[85%] text-sm leading-relaxed text-white/75">
          Get free exposure, drive more traffic to your website, reach new customers and add an
          Affiliate Program to grow your sales.
        </p>
        <Link
          href={PARTNER_CREATE_ACCOUNT_PATH}
          className="relative z-10 mt-6 inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-white/90 sm:w-auto"
        >
          Become a Partner
        </Link>
        <svg
          className="pointer-events-none absolute bottom-3 right-3 h-28 w-28 text-white/10 sm:h-32 sm:w-32"
          viewBox="0 0 96 96"
          fill="none"
          aria-hidden="true"
        >
          <rect x="14" y="58" width="12" height="24" rx="2" fill="currentColor" />
          <rect x="34" y="46" width="12" height="36" rx="2" fill="currentColor" />
          <rect x="54" y="34" width="12" height="48" rx="2" fill="currentColor" />
          <path
            d="M18 52 L48 28 L78 18"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M66 18 H78 V30"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-primary p-6 text-white sm:p-8">
        <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          For Members
        </span>
        <h2 className="mt-4 max-w-[85%] text-xl font-bold leading-tight sm:text-2xl">
          Shop Smarter. Save More. Discover New Brands.
        </h2>
        <p className="mt-3 max-w-[85%] text-sm leading-relaxed text-white/85">
          Get exclusive member-only discounts, compare offers and discover great brands for less.
        </p>
        <MemberSignupCtaLink
          variant="start-saving-now"
          className="relative z-10 mt-6 inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90 sm:w-auto"
        />
        <svg
          className="pointer-events-none absolute bottom-3 right-3 h-28 w-28 text-white/15 sm:h-32 sm:w-32"
          viewBox="0 0 96 96"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M28 18h24l16 16v34a6 6 0 01-6 6H28a6 6 0 01-6-6V24a6 6 0 016-6z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="40" cy="30" r="4" fill="currentColor" />
          <path
            d="M34 52h12M34 62h16"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <text
            x="48"
            y="58"
            fill="currentColor"
            fontSize="22"
            fontWeight="700"
            textAnchor="middle"
          >
            %
          </text>
        </svg>
      </div>
    </aside>
  );
}
