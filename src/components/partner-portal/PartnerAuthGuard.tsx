"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthSession, MEMBER_DASHBOARD_PATH, PARTNER_LOGIN_PATH } from "@/lib/auth";
import { getPartnerRecord } from "@/lib/partner-data";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

export function PartnerAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getAuthSession().then(async (session) => {
      if (!session) {
        router.replace(PARTNER_LOGIN_PATH);
        return;
      }

      if (session.accountType !== "partner") {
        router.replace(MEMBER_DASHBOARD_PATH);
        return;
      }

      const partnerRecord = await getPartnerRecord(session.id);
      if (!partnerRecord) {
        router.replace(PARTNER_APPLICATION_PATH);
        return;
      }

      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-surface">
        <p className="text-sm text-muted-foreground">Loading partner dashboard...</p>
      </div>
    );
  }

  return children;
}
