import Link from "next/link";
import {
  portalBody,
  portalBtnOutline,
  portalBtnPrimary,
  portalCard,
  portalCardContent,
  portalCardTitle,
  portalHelper,
  portalPageNarrow,
  portalPageTitle,
} from "@/lib/partner-portal-classes";

const benefits = [
  {
    title: "Reach new customers",
    description:
      "Affiliates share your brand with their audiences on social media, blogs, and email — bringing you sales you might not reach on your own.",
  },
  {
    title: "Pay only for results",
    description:
      "You set the commission rate. FoodVault tracks referrals and calculates commissions automatically, so you only pay when a sale is made.",
  },
  {
    title: "Hands-off management",
    description:
      "FoodVault handles affiliate approvals, referral links, click tracking, commission holds, and payouts — no spreadsheets required.",
  },
  {
    title: "Grow without ad spend",
    description:
      "Turn satisfied customers and content creators into promoters who recommend your products authentically.",
  },
];

const setupSteps = [
  "Open My Listing in your Partner Vault.",
  "Scroll to the Affiliate Program section.",
  "Check Enable Affiliate Program and set your commission percentage.",
  "Add a short program description and terms, then save your listing.",
  "Connect your Shopify store from the Affiliate Program dashboard to start tracking sales.",
];

export function PartnerAffiliateDisabledState() {
  return (
    <div className={`${portalPageNarrow} py-6`}>
      <div className={`${portalCard} px-5 py-5`}>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Affiliate Program
        </p>
        <h1 className={`${portalPageTitle} mt-2`}>
          Grow your brand with affiliate partners
        </h1>
        <p className={`${portalBody} mt-2 leading-relaxed text-muted-foreground`}>
          The FoodVault Affiliate Program lets people promote your brand using unique referral
          links. When someone buys through a link, the affiliate earns a commission — and you gain
          a sale you might never have reached through your own marketing.
        </p>
        <p className={`${portalHelper} mt-2 leading-relaxed`}>
          You have not enabled an affiliate program for your brand yet. Turning it on takes just a
          few minutes from your listing settings.
        </p>

        <div className={`mt-5 grid gap-3 sm:grid-cols-2`}>
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-lg border border-border bg-surface px-4 py-3">
              <h2 className={portalCardTitle}>{benefit.title}</h2>
              <p className={`${portalHelper} mt-1 leading-relaxed`}>{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className={`mt-5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3`}>
          <h2 className={portalCardTitle}>How to enable your program</h2>
          <ol className={`${portalCardContent} space-y-2`}>
            {setupSteps.map((step, index) => (
              <li key={step} className={`flex gap-2.5 ${portalHelper}`}>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.6875rem] font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="pt-px">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href="/partner/listing#affiliate" className={portalBtnPrimary}>
            Set up in My Listing
          </Link>
          <Link href="/faq#affiliate-faqs" className={portalBtnOutline}>
            Learn more in the FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
