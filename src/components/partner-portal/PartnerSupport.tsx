"use client";

import Link from "next/link";
import {
  portalCard,
  portalCardContent,
  portalCardTitle,
  portalHelper,
  portalPageHeader,
  portalPageNarrow,
  portalPageSubtitle,
  portalPageTitle,
  portalSectionTitle,
} from "@/lib/partner-portal-classes";
import { PartnerPortalShell } from "./PartnerPortalShell";
import { PartnerAffiliateSetupBanner } from "./PartnerAffiliateSetupBanner";

const partnerSupportTopics = [
  {
    title: "Getting your listing approved",
    answer: [
      "After you submit your application, our team reviews your business details, branding, and member offer. Most applications are reviewed within 2–3 business days.",
      "While your application is under review, your listing cannot be edited or published. Once approved, we email you with next steps.",
      "Before your brand appears on FoodVault, you also need to activate your member offer by adding your discount code to your website and confirming it in your Partner Portal.",
    ],
  },
  {
    title: "Creating your exclusive member offer",
    answer: [
      "Set up your offer in Partner Portal under My Listing → Member Offer. Choose whether your discount applies to your entire store or selected products, then enter your discount percentage.",
      "FoodVault generates a suggested member discount code for your brand. Members reveal your offer on FoodVault, then complete their purchase on your own website using that code.",
      "FoodVault does not process orders or take commission on sales. Every purchase happens directly on your site, and you keep the customer relationship.",
    ],
  },
  {
    title: "Updating your brand profile",
    answer: [
      "You can update most of your profile anytime from My Listing, including your logo, banner, gallery images, business information, website links, categories, products, and member offer details.",
      "Save your changes in the Partner Portal and they update what members see on your public brand profile.",
      "If your application is still under review, editing is locked until approval is complete.",
    ],
  },
  {
    title: "Adding products and improving discovery",
    answer: [
      "Add products and complete your category selections in My Listing to help members find your brand through FoodVault search and filters.",
      "Choose accurate departments and subcategories, upload product images with short descriptions, and keep your business profile complete.",
      "Brands with fuller listings, clear offers, and accurate categories are easier for members to discover when browsing or searching on FoodVault.",
    ],
  },
  {
    title: "Affiliate Program",
    answer: [
      "You can enable a free affiliate program from the Affiliate Program section in My Listing. Set your commission rate, cookie duration, and program terms.",
      "FoodVault then generates referral links for affiliates, tracks qualifying sales, calculates commissions, and manages payouts for approved referrals.",
      "You can also connect your store integration to automate affiliate order tracking when supported by your ecommerce platform.",
    ],
  },
];

export function PartnerSupport() {
  return (
    <PartnerPortalShell>
      <div className={portalPageNarrow}>
        <PartnerAffiliateSetupBanner className="mb-5" />
        <div className={portalPageHeader}>
          <h1 className={portalPageTitle}>Partner Support</h1>
          <p className={portalPageSubtitle}>
            Answers to the most common questions about managing your FoodVault partner
            listing.
          </p>
        </div>

        <div className="space-y-3">
          {partnerSupportTopics.map((item) => (
            <div key={item.title} className={portalCard}>
              <h2 className={portalCardTitle}>{item.title}</h2>
              <div className={`${portalHelper} ${portalCardContent} space-y-2.5`}>
                {item.answer.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-5 rounded-lg bg-primary px-5 py-4 text-white`}>
          <h2 className={`${portalSectionTitle} text-white`}>Still need help?</h2>
          <p className={`${portalHelper} mt-1 text-white/80`}>
            Contact our Partner Support team if you can&apos;t find the answer you&apos;re
            looking for. We typically respond within one business day.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href="mailto:support@foodvault.co.nz"
              className="inline-flex h-11 items-center justify-center rounded-sm bg-white px-5 text-sm font-medium text-primary"
            >
              Email Support
            </a>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-sm border border-white/40 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </PartnerPortalShell>
  );
}
