"use client";

import Link from "next/link";
import { AffiliateShareActions } from "@/components/affiliate/AffiliateShareActions";
import { AFFILIATE_REGISTER_PATH } from "@/lib/affiliate/paths";
import { cookieDurationLabel } from "@/lib/affiliate/format";
import type { PartnerProfile } from "@/lib/member/partner-profile";

type AffiliateProgramProfileSectionProps = {
  profile: Pick<
    PartnerProfile,
    | "affiliateCommissionPercent"
    | "affiliateCookieDurationDays"
    | "affiliateProgramDescription"
  >;
  viewerIsAffiliate: boolean;
  referralUrl: string | null;
  businessName: string;
};

export function AffiliateProgramProfileSection({
  profile,
  viewerIsAffiliate,
  referralUrl,
  businessName,
}: AffiliateProgramProfileSectionProps) {
  const commission = profile.affiliateCommissionPercent;
  if (commission == null) {
    return null;
  }

  const description =
    profile.affiliateProgramDescription?.trim() ||
    `Promote ${businessName} and earn ${commission}% commission on qualifying purchases made through your referral link.`;

  return (
    <section
      id="affiliate"
      className="rounded-lg border border-border bg-background p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-foreground">Affiliate Program</h2>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Commission
          </dt>
          <dd className="mt-0.5 text-xs font-semibold text-foreground">
            {commission}%
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Cookie Duration
          </dt>
          <dd className="mt-0.5 text-xs text-foreground">
            {cookieDurationLabel(profile.affiliateCookieDurationDays)}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Why become an affiliate?
        </p>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-foreground">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Free to join</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Promote products you already love</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Earn a commission on qualifying sales</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Referral links generated instantly</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>
              Process completely automated, just share your link and start getting paid!
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-4">
        {viewerIsAffiliate && referralUrl ? (
          <AffiliateShareActions url={referralUrl} brandName={businessName} />
        ) : viewerIsAffiliate ? (
          <p className="text-xs text-muted-foreground">
            Your referral link is being generated. Refresh shortly or visit your
            dashboard.
          </p>
        ) : (
          <Link
            href={AFFILIATE_REGISTER_PATH}
            className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
          >
            Become an Affiliate
          </Link>
        )}
      </div>
    </section>
  );
}
