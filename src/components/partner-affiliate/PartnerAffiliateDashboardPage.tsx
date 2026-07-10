"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  portalHelper,
  portalPage,
  portalPageHeader,
  portalPageSubtitle,
  portalPageTitle,
  portalTab,
} from "@/lib/partner-portal-classes";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { usePartnerOnboarding } from "@/components/partner-portal/PartnerOnboardingProvider";
import { PartnerAffiliateOrdersTable } from "@/components/partner-affiliate/PartnerAffiliateOrdersTable";
import { PartnerStoreIntegrationSection } from "@/components/store-integration/PartnerStoreIntegrationSection";
import { PartnerBillingSection } from "@/components/payment-service/PartnerBillingSection";
import { PartnerAffiliateAnalyticsSection } from "@/components/partner-affiliate/PartnerAffiliateAnalyticsSection";
import { PartnerAffiliateDetailPanel } from "@/components/partner-affiliate/PartnerAffiliateDetailPanel";
import {
  PartnerAffiliateDirectory,
} from "@/components/partner-affiliate/PartnerAffiliateDirectory";
import { PartnerAffiliateProgramOverview } from "@/components/partner-affiliate/PartnerAffiliateProgramOverview";
import { PartnerAffiliateDisabledState } from "@/components/partner-affiliate/PartnerAffiliateDisabledState";
import { PartnerReferralLinksTable } from "@/components/partner-affiliate/PartnerReferralLinksTable";
import {
  getPartnerAffiliateAnalytics,
  getPartnerAffiliateDetail,
  getPartnerAffiliateDirectory,
  getPartnerAffiliateOverview,
  getPartnerAffiliateProgram,
  getPartnerReferralLinks,
  type PartnerAffiliateAnalytics,
  type PartnerAffiliateDetail,
  type PartnerAffiliateDirectoryRow,
  type PartnerAffiliateOverview,
  type PartnerAffiliateProgram,
  type PartnerReferralLinkRow,
} from "@/lib/partner-affiliate/analytics";
import {
  PARTNER_AFFILIATE_TABS,
  parsePartnerAffiliateTab,
  type PartnerAffiliateTab,
} from "@/lib/partner-affiliate/paths";
import { cookieDurationLabel } from "@/lib/affiliate/format";
import {
  getPartnerAffiliateOrders,
  getPartnerStoreIntegration,
} from "@/lib/store-integration/queries";
import type { PartnerAffiliateOrderRow, PartnerStoreIntegration } from "@/lib/store-integration/types";
import { getPartnerBillingProfile } from "@/lib/payment-service/queries";
import type { PartnerBillingProfile } from "@/lib/payment-service/types";
import { getPartnerAffiliateProgramStatus } from "@/lib/partner-affiliate/program-status";
import type { PartnerAffiliateProgramStatus } from "@/lib/partner-affiliate/program-status";

function PartnerAffiliateDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { partner, loading: partnerLoading } = usePartnerOnboarding();

  const [activeTab, setActiveTab] = useState<PartnerAffiliateTab>(() =>
    parsePartnerAffiliateTab(searchParams.get("tab"))
  );
  const [program, setProgram] = useState<PartnerAffiliateProgram | null>(null);
  const [overview, setOverview] = useState<PartnerAffiliateOverview | null>(null);
  const [directory, setDirectory] = useState<PartnerAffiliateDirectoryRow[]>([]);
  const [analytics, setAnalytics] = useState<PartnerAffiliateAnalytics | null>(null);
  const [links, setLinks] = useState<PartnerReferralLinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [country, setCountry] = useState("");
  const [linkSearch, setLinkSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [orderSort, setOrderSort] = useState("newest");
  const [orders, setOrders] = useState<PartnerAffiliateOrderRow[]>([]);
  const [storeIntegration, setStoreIntegration] = useState<PartnerStoreIntegration>({
    connected: false,
  });
  const [billingProfile, setBillingProfile] = useState<PartnerBillingProfile>({ configured: false });
  const [programStatus, setProgramStatus] = useState<PartnerAffiliateProgramStatus | null>(null);
  const [selectedAffiliateId, setSelectedAffiliateId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PartnerAffiliateDetail | null>(null);

  useEffect(() => {
    setActiveTab(parsePartnerAffiliateTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    if (!partner) return;

    let cancelled = false;

    async function load() {
      if (!partner) return;
      setLoading(true);
      const [programData, overviewData, analyticsData, integrationData, billingData, statusData] =
        await Promise.all([
        getPartnerAffiliateProgram(partner.id),
        getPartnerAffiliateOverview(partner.id),
        getPartnerAffiliateAnalytics(partner.id),
        getPartnerStoreIntegration(partner.id),
        getPartnerBillingProfile(partner.id),
        getPartnerAffiliateProgramStatus(partner.id),
      ]);

      if (cancelled) return;

      setProgram(programData);
      setOverview(overviewData);
      setAnalytics(analyticsData);
      setStoreIntegration(integrationData);
      setBillingProfile(billingData);
      setProgramStatus(statusData);

      if (overviewData?.enabled) {
        const [directoryRows, linkRows, orderRows] = await Promise.all([
          getPartnerAffiliateDirectory(partner.id, { search, sort, country }),
          getPartnerReferralLinks(partner.id, linkSearch),
          getPartnerAffiliateOrders(partner.id, {
            search: orderSearch,
            status: orderStatus,
            sort: orderSort,
          }),
        ]);
        if (!cancelled) {
          setDirectory(directoryRows);
          setLinks(linkRows);
          setOrders(orderRows);
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [partner, search, sort, country, linkSearch, orderSearch, orderStatus, orderSort]);

  useEffect(() => {
    if (!partner || !selectedAffiliateId) {
      setDetail(null);
      return;
    }

    getPartnerAffiliateDetail(partner.id, selectedAffiliateId).then(setDetail);
  }, [partner, selectedAffiliateId]);

  const countries = useMemo(
    () => [...new Set(directory.map((row) => row.country).filter(Boolean))].sort(),
    [directory]
  );

  function handleTabChange(tab: PartnerAffiliateTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `/partner/affiliate-program?${query}` : "/partner/affiliate-program", {
      scroll: false,
    });
  }

  if (partnerLoading || loading) {
    return (
      <PartnerPortalShell>
        <div className={portalPage}>
          <p className={portalHelper}>Loading affiliate dashboard...</p>
        </div>
      </PartnerPortalShell>
    );
  }

  if (!program?.affiliateEnabled || !overview?.enabled) {
    return (
      <PartnerPortalShell>
        <PartnerAffiliateDisabledState />
      </PartnerPortalShell>
    );
  }

  return (
    <PartnerPortalShell>
      <div className={portalPage}>
        <div className={`${portalPageHeader} flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between`}>
          <div>
            <h1 className={portalPageTitle}>Affiliate Program</h1>
            <p className={portalPageSubtitle}>
              See how your affiliate program is performing and confirm everything is working as
              expected.
            </p>
          </div>
          <div className={portalHelper}>
            Commission {program.commissionPercent ?? "—"}% · Cookie{" "}
            {cookieDurationLabel(program.cookieDurationDays)}
            {program.slug ? (
              <>
                {" "}
                ·{" "}
                <Link href={`/brands/${program.slug}`} className="font-medium text-primary">
                  View public profile
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border pb-1">
          {PARTNER_AFFILIATE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`${portalTab} ${
                activeTab === tab.id
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && programStatus?.enabled ? (
          <PartnerAffiliateProgramOverview
            status={programStatus}
            onNavigateTab={handleTabChange}
          />
        ) : null}

        {activeTab === "affiliates" ? (
          <PartnerAffiliateDirectory
            rows={directory}
            countries={countries}
            onSelect={setSelectedAffiliateId}
            onSearchChange={setSearch}
            onSortChange={setSort}
            onCountryChange={setCountry}
            search={search}
            sort={sort}
            country={country}
          />
        ) : null}

        {activeTab === "analytics" && analytics ? (
          <PartnerAffiliateAnalyticsSection analytics={analytics} />
        ) : null}

        {activeTab === "orders" ? (
          <PartnerAffiliateOrdersTable
            rows={orders}
            search={orderSearch}
            status={orderStatus}
            sort={orderSort}
            onSearchChange={setOrderSearch}
            onStatusChange={setOrderStatus}
            onSortChange={setOrderSort}
          />
        ) : null}

        {activeTab === "integration" ? (
          <PartnerStoreIntegrationSection integration={storeIntegration} />
        ) : null}

        {activeTab === "billing" ? (
          <PartnerBillingSection billing={billingProfile} />
        ) : null}

        {activeTab === "links" ? (
          <PartnerReferralLinksTable
            rows={links}
            search={linkSearch}
            onSearchChange={setLinkSearch}
          />
        ) : null}
      </div>

      <PartnerAffiliateDetailPanel
        detail={detail}
        open={Boolean(selectedAffiliateId)}
        onClose={() => setSelectedAffiliateId(null)}
      />
    </PartnerPortalShell>
  );
}

export function PartnerAffiliateDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading...</div>}>
      <PartnerAffiliateDashboardContent />
    </Suspense>
  );
}
