import Link from "next/link";
import type { PartnerAffiliateInsight } from "@/lib/partner-affiliate/analytics";
import {
  portalBtnOutline,
  portalBtnPrimary,
  portalCard,
  portalCardTitle,
  portalHelper,
} from "@/lib/partner-portal-classes";

const INSIGHT_COPY: Record<
  PartnerAffiliateInsight,
  { title: string; body: string; primaryHref?: string; primaryLabel?: string }
> = {
  no_affiliates: {
    title: "No affiliates yet",
    body: "Share your Affiliate Program with your customers and encourage creators to promote your products.",
    primaryLabel: "View public profile",
  },
  no_clicks: {
    title: "Affiliates are registered, but no clicks yet",
    body: "Encourage affiliates to share their referral links on social media, email, and content platforms.",
  },
  high_clicks_no_sales: {
    title: "Your links are generating interest",
    body: "Once sales tracking is connected, consider reviewing your member offer or landing pages to improve conversion.",
  },
  growing: {
    title: "Your Affiliate Program is growing",
    body: "Referral activity is increasing. Keep promoting your program to reach more affiliates.",
  },
};

type PartnerAffiliateInsightBannerProps = {
  insight: PartnerAffiliateInsight | null;
  profileSlug?: string;
};

export function PartnerAffiliateInsightBanner({
  insight,
  profileSlug,
}: PartnerAffiliateInsightBannerProps) {
  if (!insight) {
    return null;
  }

  const copy = INSIGHT_COPY[insight];
  const profileHref = profileSlug ? `/brands/${profileSlug}` : "/partner/listing#affiliate";

  return (
    <div className={`${portalCard} border-primary/20 bg-primary/5`}>
      <h2 className={portalCardTitle}>{copy.title}</h2>
      <p className={`${portalHelper} mt-1.5 leading-relaxed`}>{copy.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {copy.primaryLabel ? (
          <Link
            href={profileHref}
            className={portalBtnPrimary}
          >
            {copy.primaryLabel}
          </Link>
        ) : null}
        <Link
          href="/partner/listing#affiliate"
          className={`${portalBtnOutline} hover:bg-primary/5`}
        >
          Program settings
        </Link>
      </div>
    </div>
  );
}
