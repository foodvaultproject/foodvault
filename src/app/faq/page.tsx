import type { Metadata } from "next";
import { headers } from "next/headers";
import { FAQMainContent } from "@/components/faq/FAQContent";
import { FAQContactCTA, FAQHero } from "@/components/faq/FAQPageSections";
import { StockUpFaqPage } from "@/components/faq/StockUpFaqPage";
import {
  STOCKUP_FAQ_CANONICAL,
  STOCKUP_FAQ_DESCRIPTION,
  STOCKUP_FAQ_TITLE,
  stockUpFaqEntities,
  stockUpFaqPlainAnswer,
} from "@/data/stockup-faq";
import { getMemberFaqs } from "@/data/faq";
import { getAppMode, STOCKUP_ORIGIN } from "@/lib/app-mode";
import { getCachedMembershipSettings } from "@/lib/cache/public-directory";
import { formatMembershipPriceMonthly } from "@/lib/member/pricing";

export const revalidate = 86400;

async function requestIsStockUp() {
  const headerStore = await headers();
  return getAppMode(headerStore.get("x-forwarded-host") ?? headerStore.get("host")) === "stockup";
}

export async function generateMetadata(): Promise<Metadata> {
  const stockup = await requestIsStockUp();

  if (stockup) {
    return {
      title: { absolute: STOCKUP_FAQ_TITLE },
      description: STOCKUP_FAQ_DESCRIPTION,
      keywords: [
        "New Zealand online shopping",
        "online grocery shopping NZ",
        "easy online shopping experience",
        "fast pantry delivery NZ",
        "saved grocery lists",
        "automated recurring grocery orders",
        "auto-reorder basic essentials",
        "organic pantry staples New Zealand",
        "wide range of organic products NZ",
      ],
      alternates: { canonical: STOCKUP_FAQ_CANONICAL },
      openGraph: {
        type: "website",
        locale: "en_NZ",
        url: STOCKUP_FAQ_CANONICAL,
        siteName: "StockUp",
        title: STOCKUP_FAQ_TITLE,
        description: STOCKUP_FAQ_DESCRIPTION,
      },
      twitter: {
        card: "summary_large_image",
        title: STOCKUP_FAQ_TITLE,
        description: STOCKUP_FAQ_DESCRIPTION,
      },
    };
  }

  const settings = await getCachedMembershipSettings();
  const priceLabel = formatMembershipPriceMonthly(settings.membershipPriceMonthly);

  return {
    title: "Help Centre",
    description: `Find answers about FOODVAULT memberships in New Zealand (${priceLabel}), partner listings, the Affiliate Program, billing, and how the platform works.`,
  };
}

export default async function FAQPage() {
  const stockup = await requestIsStockUp();

  if (stockup) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: stockUpFaqEntities().map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: stockUpFaqPlainAnswer(item),
        },
      })),
    };
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: STOCKUP_ORIGIN },
        { "@type": "ListItem", position: 2, name: "FAQ", item: STOCKUP_FAQ_CANONICAL },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <StockUpFaqPage />
      </>
    );
  }

  const settings = await getCachedMembershipSettings();
  const memberFaqs = getMemberFaqs(settings);

  return (
    <>
      <FAQHero settings={settings} />
      <FAQMainContent memberFaqs={memberFaqs} />
      <FAQContactCTA />
    </>
  );
}
