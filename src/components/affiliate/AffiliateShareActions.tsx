"use client";

import { useState } from "react";
import {
  copyTextToClipboard,
  qrCodeImageUrl,
  shareReferralLink,
} from "@/lib/affiliate/links";

type AffiliateShareActionsProps = {
  url: string;
  brandName: string;
  compact?: boolean;
};

export function AffiliateShareActions({
  url,
  brandName,
  compact = false,
}: AffiliateShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleCopy() {
    await copyTextToClipboard(url);
    setCopied(true);
    setStatus("Link copied");
    window.setTimeout(() => {
      setCopied(false);
      setStatus(null);
    }, 2000);
  }

  async function handleShare() {
    const shared = await shareReferralLink(url, brandName);
    if (!shared) {
      await handleCopy();
    }
  }

  const buttonClass = compact
    ? "inline-flex items-center justify-center rounded-sm border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
    : "inline-flex items-center justify-center rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-primary/5 hover:text-primary";

  return (
    <>
      <div className={`flex flex-wrap gap-2 ${compact ? "" : "gap-3"}`}>
        <button type="button" onClick={() => void handleCopy()} className={buttonClass}>
          {copied ? "Copied" : "Copy Referral Link"}
        </button>
        <button type="button" onClick={() => setQrOpen(true)} className={buttonClass}>
          QR Code
        </button>
        <button type="button" onClick={() => void handleShare()} className={buttonClass}>
          Share
        </button>
      </div>
      {status ? <p className="mt-2 text-xs text-success">{status}</p> : null}

      {qrOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Referral QR Code</h3>
                <p className="mt-1 text-sm text-muted-foreground">{brandName}</p>
              </div>
              <button
                type="button"
                onClick={() => setQrOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeImageUrl(url)}
                alt={`QR code for ${brandName} referral link`}
                className="rounded-lg border border-border"
                width={220}
                height={220}
              />
            </div>
            <p className="mt-4 break-all text-xs text-muted-foreground">{url}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
