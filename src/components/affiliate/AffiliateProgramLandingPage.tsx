import Link from "next/link";
import { AFFILIATE_REGISTER_PATH } from "@/lib/affiliate/paths";

export function AffiliateProgramLandingPage() {
  return (
    <div className="bg-surface">
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            Affiliate Program
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Earn commission promoting FoodVault brands
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Join the FoodVault Affiliate Program for free, promote participating brands, and earn
            commission on qualifying purchases made through your referral links.
          </p>
          <Link
            href={AFFILIATE_REGISTER_PATH}
            className="fv-btn-primary mt-8 inline-flex items-center justify-center rounded-sm px-6 py-4 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
          >
            Become an Affiliate
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Questions? Read the{" "}
            <Link href="/faq#affiliate-faqs" className="font-semibold text-primary hover:text-primary-hover">
              Affiliate FAQ
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Completely free",
              body: "There is no cost to join and no approval waiting period.",
            },
            {
              title: "Every participating brand",
              body: "Once registered, you can immediately promote every FoodVault brand with an affiliate program enabled.",
            },
            {
              title: "Simple referral links",
              body: "Copy your unique link, share it anywhere, and FoodVault tracks clicks automatically.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-border bg-background p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground">How it works</h2>
          <ol className="mt-6 space-y-4">
            {[
              "Create your free affiliate account in minutes.",
              "Open your dashboard and choose any participating FoodVault brand.",
              "Copy your unique referral link and share it with your audience.",
              "FoodVault tracks clicks automatically and pays commission after a 30-day hold period.",
            ].map((step, index) => (
              <li key={step} className="flex gap-4 rounded-lg border border-border p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
