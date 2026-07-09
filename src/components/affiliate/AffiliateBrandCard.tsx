"use client";

import { PartnerLogo } from "@/components/partners/PartnerLogo";
import { AffiliateShareActions } from "@/components/affiliate/AffiliateShareActions";
import type { AffiliateParticipatingBrand } from "@/lib/affiliate/types";
import { cookieDurationLabel } from "@/lib/affiliate/format";

type AffiliateBrandCardProps = {
  brand: AffiliateParticipatingBrand;
};

export function AffiliateBrandCard({ brand }: AffiliateBrandCardProps) {
  const referralUrl = brand.referralLink?.url ?? null;

  return (
    <article className="rounded-lg border border-border bg-background p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <PartnerLogo
          businessName={brand.businessName}
          alt={brand.businessName}
          src={brand.logoUrl}
          originalSrc={brand.logoOriginalUrl}
          crop={brand.logoCrop}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-foreground">{brand.businessName}</h3>
          {brand.shortDescription ? (
            <p className="mt-1 text-sm text-muted-foreground">{brand.shortDescription}</p>
          ) : null}
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Commission
          </dt>
          <dd className="mt-1 text-sm font-semibold text-foreground">
            {brand.commissionPercent != null ? `${brand.commissionPercent}%` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cookie Duration
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            {cookieDurationLabel(brand.cookieDurationDays)}
          </dd>
        </div>
      </dl>

      {brand.programDescription ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {brand.programDescription}
        </p>
      ) : null}

      {referralUrl ? (
        <div className="mt-5 border-t border-border pt-5">
          <AffiliateShareActions url={referralUrl} brandName={brand.businessName} />
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          Referral link is being generated. Refresh in a moment.
        </p>
      )}
    </article>
  );
}
