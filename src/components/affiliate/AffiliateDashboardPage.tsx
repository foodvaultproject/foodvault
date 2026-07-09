"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AffiliateBrandCard } from "@/components/affiliate/AffiliateBrandCard";
import {
  AffiliatePortalShell,
  affiliateDashboardTabFromSearchParams,
} from "@/components/affiliate/AffiliatePortalShell";
import { AffiliatePayoutSettings } from "@/components/payment-service/AffiliatePayoutSettings";
import { createClient } from "@/lib/supabase/client";
import { getAuthSession, isSupabaseConfigured } from "@/lib/auth";
import {
  getAffiliateDashboardStats,
  getAffiliateParticipatingBrands,
  getAffiliateRecord,
  updateAffiliateSettings,
} from "@/lib/affiliate/data";
import type {
  AffiliateDashboardStats,
  AffiliateParticipatingBrand,
  AffiliateRecord,
} from "@/lib/affiliate/types";
import type { AffiliateDashboardTab } from "@/lib/affiliate/paths";
import { formatClickDate, formatCurrency } from "@/lib/affiliate/format";
import { getAffiliateRecentOrders } from "@/lib/store-integration/queries";
import type { AffiliateOrderRow } from "@/lib/store-integration/types";
import { CommissionStatusBadge } from "@/components/store-integration/CommissionStatusBadge";
import {
  getAffiliatePayoutAccount,
  getAffiliatePayoutHistory,
} from "@/lib/payment-service/queries";
import type { AffiliatePayoutAccount, PayoutHistoryItem } from "@/lib/payment-service/types";
import { getAffiliateDashboardInsights } from "@/lib/notification-service/queries";
import type { DashboardInsight } from "@/lib/notification-service/types";
import { InsightBannerList } from "@/components/notification-service/InsightBannerList";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export function AffiliateDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AffiliateDashboardTab>(() =>
    affiliateDashboardTabFromSearchParams(searchParams)
  );
  const [affiliate, setAffiliate] = useState<AffiliateRecord | null>(null);
  const [stats, setStats] = useState<AffiliateDashboardStats | null>(null);
  const [brands, setBrands] = useState<AffiliateParticipatingBrand[]>([]);
  const [recentOrders, setRecentOrders] = useState<AffiliateOrderRow[]>([]);
  const [payoutAccount, setPayoutAccount] = useState<AffiliatePayoutAccount>({ connected: false });
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistoryItem[]>([]);
  const [insights, setInsights] = useState<DashboardInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [settingsForm, setSettingsForm] = useState({
    firstName: "",
    lastName: "",
    country: "New Zealand",
    paymentCountry: "New Zealand",
    password: "",
    confirmPassword: "",
  });

  async function loadPayoutData(affiliateId: string) {
    const [account, history, insightData] = await Promise.all([
      getAffiliatePayoutAccount(affiliateId),
      getAffiliatePayoutHistory(affiliateId),
      getAffiliateDashboardInsights(affiliateId),
    ]);
    setPayoutAccount(account);
    setPayoutHistory(history);
    setInsights(insightData);
  }

  async function refreshPayoutAccount() {
    await fetch("/api/payments/connect/refresh", { method: "POST" });
    if (affiliate) {
      await loadPayoutData(affiliate.id);
    }
  }

  useEffect(() => {
    setActiveTab(affiliateDashboardTabFromSearchParams(searchParams));
    if (searchParams.get("connect") === "return") {
      void refreshPayoutAccount();
    }
  }, [searchParams]);

  useEffect(() => {
    getAuthSession().then(async (session) => {
      if (!session) return;
      const record = await getAffiliateRecord(session.id);
      if (!record) return;

      setAffiliate(record);
      setSettingsForm((current) => ({
        ...current,
        firstName: record.firstName,
        lastName: record.lastName,
        country: record.country,
        paymentCountry: record.paymentCountry,
      }));

      const [nextStats, nextBrands, nextOrders] = await Promise.all([
        getAffiliateDashboardStats(record.id),
        getAffiliateParticipatingBrands(record.id),
        getAffiliateRecentOrders(record.id),
      ]);
      await loadPayoutData(record.id);
      setStats(nextStats);
      setBrands(nextBrands);
      setRecentOrders(nextOrders);
      setLoading(false);
    });
  }, []);

  function handleTabChange(tab: AffiliateDashboardTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "dashboard") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `/affiliate/dashboard?${query}` : "/affiliate/dashboard", {
      scroll: false,
    });
  }

  async function handleSettingsSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!affiliate) return;

    setSettingsSaving(true);
    setStatus(null);

    try {
      await updateAffiliateSettings(affiliate.userId, {
        firstName: settingsForm.firstName,
        lastName: settingsForm.lastName,
        country: settingsForm.country,
        paymentCountry: settingsForm.paymentCountry,
      });
      const refreshed = await getAffiliateRecord(affiliate.userId);
      if (refreshed) setAffiliate(refreshed);
      setStatus({ type: "success", message: "Account settings saved." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to save settings.",
      });
    } finally {
      setSettingsSaving(false);
    }
  }

  async function handlePasswordSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSupabaseConfigured()) {
      setStatus({ type: "error", message: "Password updates are unavailable in demo mode." });
      return;
    }

    if (settingsForm.password.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters." });
      return;
    }

    if (settingsForm.password !== settingsForm.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setPasswordSaving(true);
    setStatus(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: settingsForm.password,
    });

    setPasswordSaving(false);

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setSettingsForm((current) => ({ ...current, password: "", confirmPassword: "" }));
    setStatus({ type: "success", message: "Password updated." });
  }

  const greeting = useMemo(() => {
    if (!affiliate) return "Affiliate Dashboard";
    return `Welcome, ${affiliate.firstName}`;
  }, [affiliate]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-surface">
        <p className="text-sm text-muted-foreground">Loading affiliate dashboard...</p>
      </div>
    );
  }

  return (
    <AffiliatePortalShell activeTab={activeTab} onTabChange={handleTabChange}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{greeting}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Copy referral links, share them anywhere, and track clicks automatically.
          </p>
        </div>

        {status ? (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm ${
              status.type === "success"
                ? "bg-success-light text-success"
                : "bg-red-50 text-red-700"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        {activeTab === "dashboard" && stats ? (
          <div className="space-y-8">
            <InsightBannerList insights={insights} />

            {!payoutAccount.payoutsEnabled && stats.approvedEarnings > 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                You have {formatCurrency(stats.approvedEarnings)} in approved earnings. Complete{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("settings")}
                  className="font-semibold underline"
                >
                  Stripe Connect onboarding
                </button>{" "}
                in Payout Settings to receive monthly payouts.
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard label="Participating Brands" value={stats.participatingBrands} />
              <SummaryCard label="Referral Links" value={stats.referralLinks} />
              <SummaryCard label="Total Clicks" value={stats.totalClicks} />
              <SummaryCard label="Total Sales" value={formatCurrency(stats.totalSales)} />
              <SummaryCard label="Orders" value={stats.totalOrders} />
              <SummaryCard
                label="Pending Earnings"
                value={formatCurrency(stats.pendingEarnings)}
              />
              <SummaryCard
                label="Approved Earnings"
                value={formatCurrency(stats.approvedEarnings)}
              />
              <SummaryCard label="Paid Earnings" value={formatCurrency(stats.paidEarnings)} />
            </div>

            <section className="rounded-lg border border-border bg-background p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">Click Analytics</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard label="Clicks Today" value={stats.clicksToday} />
                <SummaryCard label="Last 7 Days" value={stats.clicksLast7Days} />
                <SummaryCard label="Last 30 Days" value={stats.clicksLast30Days} />
                <SummaryCard label="All Time" value={stats.totalClicks} />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Commissions are held for 30 days before moving to Approved. Approved commissions
                are paid monthly through Stripe Connect after onboarding is complete.
              </p>
            </section>

            <section className="rounded-lg border border-border bg-background p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No attributed orders yet. Share your referral links to start earning commission.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2">Brand</th>
                        <th className="px-3 py-2">Order Date</th>
                        <th className="px-3 py-2">Order Total</th>
                        <th className="px-3 py-2">Comm %</th>
                        <th className="px-3 py-2">Commission</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.commissionId} className="border-b border-border/70">
                          <td className="px-3 py-3 font-medium text-foreground">
                            {order.brandName}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {formatClickDate(order.orderDate)}
                          </td>
                          <td className="px-3 py-3 text-foreground">
                            {formatCurrency(order.grossTotal, order.currency)}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {order.commissionPercent}%
                          </td>
                          <td className="px-3 py-3 text-foreground">
                            {formatCurrency(order.commissionValue, order.currency)}
                          </td>
                          <td className="px-3 py-3">
                            <CommissionStatusBadge status={order.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-border bg-background p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">Recent Clicks</h2>
              {stats.recentClicks.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No clicks yet. Share a referral link to start tracking visits.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2">Brand</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Device</th>
                        <th className="px-3 py-2">Referrer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentClicks.map((click) => (
                        <tr key={click.id} className="border-b border-border/70">
                          <td className="px-3 py-3 font-medium text-foreground">
                            {click.brandName}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {formatClickDate(click.clickedAt)}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {click.device ?? "Unknown"}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {click.referrer?.trim() ? click.referrer : "Direct"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        ) : null}

        {activeTab === "brands" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">My Brands</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You are automatically eligible to promote every participating FoodVault brand.
              </p>
            </div>
            {brands.length === 0 ? (
              <div className="rounded-lg border border-border bg-background p-8 text-center shadow-sm">
                <p className="text-sm text-muted-foreground">
                  No participating brands yet. Check back soon as more brands enable their affiliate
                  programs.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {brands.map((brand) => (
                  <AffiliateBrandCard key={brand.id} brand={brand} />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <AffiliatePayoutSettings
              payoutAccount={payoutAccount}
              payoutHistory={payoutHistory}
              approvedEarnings={stats?.approvedEarnings ?? 0}
              onRefresh={refreshPayoutAccount}
            />

            <div className="space-y-6">
              <form
                onSubmit={handleSettingsSave}
                className="rounded-lg border border-border bg-background p-6 shadow-sm"
              >
                <h2 className="text-lg font-bold text-foreground">Account Settings</h2>
                <div className="mt-6 grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">First Name</label>
                      <input
                        value={settingsForm.firstName}
                        onChange={(e) =>
                          setSettingsForm((current) => ({ ...current, firstName: e.target.value }))
                        }
                        className={`mt-2 ${inputClass}`}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Last Name</label>
                      <input
                        value={settingsForm.lastName}
                        onChange={(e) =>
                          setSettingsForm((current) => ({ ...current, lastName: e.target.value }))
                        }
                        className={`mt-2 ${inputClass}`}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Country</label>
                    <input
                      value={settingsForm.country}
                      onChange={(e) =>
                        setSettingsForm((current) => ({ ...current, country: e.target.value }))
                      }
                      className={`mt-2 ${inputClass}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Payment Country</label>
                    <input
                      value={settingsForm.paymentCountry}
                      onChange={(e) =>
                        setSettingsForm((current) => ({
                          ...current,
                          paymentCountry: e.target.value,
                        }))
                      }
                      className={`mt-2 ${inputClass}`}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="mt-6 fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
                >
                  {settingsSaving ? "Saving..." : "Save Settings"}
                </button>
              </form>

              <form
                onSubmit={handlePasswordSave}
                className="rounded-lg border border-border bg-background p-6 shadow-sm"
              >
                <h2 className="text-lg font-bold text-foreground">Password</h2>
                <div className="mt-6 grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <input
                      type="password"
                      value={settingsForm.password}
                      onChange={(e) =>
                        setSettingsForm((current) => ({ ...current, password: e.target.value }))
                      }
                      className={`mt-2 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Confirm Password</label>
                    <input
                      type="password"
                      value={settingsForm.confirmPassword}
                      onChange={(e) =>
                        setSettingsForm((current) => ({
                          ...current,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className={`mt-2 ${inputClass}`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="mt-6 inline-flex rounded-sm border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-primary/5 disabled:opacity-60"
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </AffiliatePortalShell>
  );
}
