"use client";

import { Suspense } from "react";
import { AffiliateAuthGuard } from "@/components/affiliate/AffiliateAuthGuard";
import { AffiliateDashboardPage } from "@/components/affiliate/AffiliateDashboardPage";

export default function AffiliateDashboardRoute() {
  return (
    <AffiliateAuthGuard>
      <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading...</div>}>
        <AffiliateDashboardPage />
      </Suspense>
    </AffiliateAuthGuard>
  );
}
