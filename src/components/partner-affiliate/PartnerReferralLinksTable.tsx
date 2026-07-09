"use client";

import { copyTextToClipboard } from "@/lib/affiliate/links";
import type { PartnerReferralLinkRow } from "@/lib/partner-affiliate/analytics";
import {
  portalHelper,
  portalInput,
  portalSectionTitle,
  portalTableWrap,
} from "@/lib/partner-portal-classes";
import { useState } from "react";

type PartnerReferralLinksTableProps = {
  rows: PartnerReferralLinkRow[];
  search: string;
  onSearchChange: (value: string) => void;
};

export function PartnerReferralLinksTable({
  rows,
  search,
  onSearchChange,
}: PartnerReferralLinksTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(linkId: string, url: string) {
    await copyTextToClipboard(url);
    setCopiedId(linkId);
    window.setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className={portalSectionTitle}>Referral Links</h2>
        <p className={`${portalHelper} mt-1`}>
          All links generated automatically for your brand.
        </p>
      </div>

      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search affiliate or URL"
        className={`max-w-md ${portalInput}`}
      />

      <div className={portalTableWrap}>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Affiliate</th>
              <th className="px-4 py-3">Referral URL</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.linkId} className="border-b border-border/70">
                <td className="px-4 py-3 font-medium text-foreground">{row.affiliateName}</td>
                <td className="max-w-[280px] truncate px-4 py-3 text-muted-foreground">
                  {row.referralUrl}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(row.createdAt).toLocaleDateString("en-NZ")}
                </td>
                <td className="px-4 py-3 text-foreground">{row.clicks}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void handleCopy(row.linkId, row.referralUrl)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary/5"
                  >
                    {copiedId === row.linkId ? "Copied" : "Copy Link"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">No referral links found.</p>
        ) : null}
      </div>
    </div>
  );
}
