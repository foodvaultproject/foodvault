"use client";

import { AffiliateShareActions } from "@/components/affiliate/AffiliateShareActions";
import type { PartnerAffiliateDetail } from "@/lib/partner-affiliate/analytics";
import { formatClickDate } from "@/lib/affiliate/format";
import {
  portalBody,
  portalHelper,
  portalLabel,
  portalSectionTitle,
} from "@/lib/partner-portal-classes";

type PartnerAffiliateDetailPanelProps = {
  detail: PartnerAffiliateDetail | null;
  open: boolean;
  onClose: () => void;
};

export function PartnerAffiliateDetailPanel({
  detail,
  open,
  onClose,
}: PartnerAffiliateDetailPanelProps) {
  if (!open || !detail) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-foreground/30"
        onClick={onClose}
        aria-label="Close affiliate detail"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className={portalSectionTitle}>{detail.fullName}</h2>
            <p className={`${portalHelper} mt-0.5`}>
              {detail.country} · {detail.status}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <dl className="grid gap-4">
            <div>
              <dt className={`${portalLabel} uppercase tracking-wide text-muted-foreground`}>
                Joined
              </dt>
              <dd className={`${portalBody} mt-1`}>
                {new Date(detail.joinedAt).toLocaleDateString("en-NZ")}
              </dd>
            </div>
            <div>
              <dt className={`${portalLabel} uppercase tracking-wide text-muted-foreground`}>
                Total Clicks
              </dt>
              <dd className={`${portalBody} mt-1 font-semibold`}>{detail.totalClicks}</dd>
            </div>
            <div>
              <dt className={`${portalLabel} uppercase tracking-wide text-muted-foreground`}>
                Estimated Sales
              </dt>
              <dd className={`${portalHelper} mt-1`}>Coming Soon</dd>
            </div>
            <div>
              <dt className={`${portalLabel} uppercase tracking-wide text-muted-foreground`}>
                Estimated Earnings
              </dt>
              <dd className={`${portalHelper} mt-1`}>Coming Soon</dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-border pt-6">
            <p className={`${portalLabel} uppercase tracking-wide text-muted-foreground`}>
              Referral Link
            </p>
            <p className={`${portalBody} mt-2 break-all`}>{detail.referralUrl}</p>
            <div className="mt-4">
              <AffiliateShareActions
                url={detail.referralUrl}
                brandName={detail.fullName}
                compact
              />
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <p className={`${portalLabel} uppercase tracking-wide text-muted-foreground`}>
              Recent Activity
            </p>
            {detail.recentActivity.length === 0 ? (
              <p className={`${portalHelper} mt-2`}>No recent clicks.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {detail.recentActivity.map((event, index) => (
                  <li key={`${event.clickedAt}-${index}`} className={portalHelper}>
                    {formatClickDate(event.clickedAt)} · {event.device ?? "Unknown"} ·{" "}
                    {event.referrer?.trim() ? event.referrer : "Direct"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
