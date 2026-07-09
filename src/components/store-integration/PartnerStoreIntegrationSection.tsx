"use client";

import { useState } from "react";
import type { PartnerStoreIntegration } from "@/lib/store-integration/types";
import { disconnectPartnerStoreAction } from "@/lib/store-integration/actions";
import { formatClickDate } from "@/lib/affiliate/format";
import {
  portalCard,
  portalCardTitle,
  portalHelper,
  portalSectionTitle,
} from "@/lib/partner-portal-classes";

type PartnerStoreIntegrationSectionProps = {
  integration: PartnerStoreIntegration;
  shopInput?: string;
};

export function PartnerStoreIntegrationSection({
  integration,
}: PartnerStoreIntegrationSectionProps) {
  const [shop, setShop] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await disconnectPartnerStoreAction("shopify");
    } finally {
      setDisconnecting(false);
    }
  }

  const isConnected = integration.connected && integration.status === "connected";
  const isDisconnected = integration.status === "disconnected" || integration.status === "paused";

  return (
    <div className="space-y-4">
      <div>
        <h2 className={portalSectionTitle}>Store Integration</h2>
        <p className={`${portalHelper} mt-1`}>
          Connect your ecommerce store to automatically track affiliate sales and calculate
          commissions.
        </p>
      </div>

      {isDisconnected && integration.externalStoreId ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <h3 className={portalCardTitle}>Store Connection Lost</h3>
          <p className={`${portalHelper} mt-1`}>
            Order imports are paused. Historical sales and commissions are preserved. Reconnect to
            resume automatic tracking.
          </p>
          {integration.lastSyncAt ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Last successful sync: {formatClickDate(integration.lastSyncAt)}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={portalCard}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Connection Status
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {isConnected ? "✅ Connected" : "⚪ Not Connected"}
              </p>
            </div>

            {isConnected ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Current Provider
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">Shopify</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Connected Store
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{integration.storeName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Store URL
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {integration.storeUrl ?? integration.externalStoreId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Connection Date
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {integration.connectedAt
                      ? new Date(integration.connectedAt).toLocaleDateString("en-NZ")
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sync Status
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {integration.status === "connected" ? "✅ Syncing" : integration.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Last Sync
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {integration.lastSyncAt
                      ? formatClickDate(integration.lastSyncAt)
                      : "Waiting for first order"}
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Current Provider
                  </p>
                  <p className="mt-1 text-sm text-foreground">Shopify</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Future Providers
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    WooCommerce · BigCommerce · Magento · Custom API
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Shopify store domain</label>
                  <input
                    value={shop}
                    onChange={(e) => setShop(e.target.value)}
                    placeholder="your-brand.myshopify.com"
                    className="mt-2 w-full max-w-md rounded-md border border-border bg-background px-4 py-3 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-3">
            {isConnected ? (
              <button
                type="button"
                onClick={() => void handleDisconnect()}
                disabled={disconnecting}
                className="rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-primary/5 disabled:opacity-60"
              >
                {disconnecting ? "Disconnecting..." : "Disconnect Store"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!shop.trim()) return;
                  window.location.href = `/api/integrations/shopify/connect?shop=${encodeURIComponent(shop.trim())}`;
                }}
                className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
              >
                Connect Shopify Store
              </button>
            )}
          </div>
        </div>

        {!isConnected ? (
          <p className="mt-6 text-xs text-muted-foreground">
            FoodVault requests read-only order access. Store credentials are encrypted and never
            shown in the dashboard.
          </p>
        ) : (
          <div className="mt-6 border-t border-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Attribution Setup
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Referral links append <code className="rounded bg-surface px-1">fv_ref</code> to your
              website URL. Add this snippet to your Shopify theme so checkout orders include the
              referral token:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-surface p-4 text-xs text-foreground">
{`<script>
  (function () {
    var match = location.search.match(/[?&]fv_ref=([^&]+)/);
    if (!match) return;
    document.cookie = "fv_ref=" + match[1] + "; path=/; max-age=7776000; SameSite=Lax";
    fetch("/cart/update.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attributes: { fv_ref: match[1] } })
    });
  })();
</script>`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
