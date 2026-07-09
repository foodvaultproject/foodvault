"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AFFILIATE_DASHBOARD_PATH,
  AFFILIATE_LOGIN_PATH,
  AFFILIATE_REGISTER_PATH,
} from "@/lib/affiliate/paths";
import { getAuthSession } from "@/lib/auth";
import { getAffiliateRecord } from "@/lib/affiliate/data";

export function AffiliateAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getAuthSession().then(async (session) => {
      if (!session) {
        router.replace(AFFILIATE_LOGIN_PATH);
        return;
      }

      if (session.accountType !== "affiliate") {
        router.replace(AFFILIATE_REGISTER_PATH);
        return;
      }

      const affiliate = await getAffiliateRecord(session.id);
      if (!affiliate) {
        router.replace(AFFILIATE_REGISTER_PATH);
        return;
      }

      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-surface">
        <p className="text-sm text-muted-foreground">Loading affiliate dashboard...</p>
      </div>
    );
  }

  return children;
}

export function AffiliateGuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getAuthSession().then(async (session) => {
      if (session?.accountType === "affiliate") {
        const affiliate = await getAffiliateRecord(session.id);
        if (affiliate) {
          router.replace(AFFILIATE_DASHBOARD_PATH);
          return;
        }
      }
      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-surface">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return children;
}
