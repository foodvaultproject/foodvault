"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getAuthSession, MEMBER_DASHBOARD_PATH, PARTNER_LOGIN_PATH } from "@/lib/auth";
import { getPartnerRecord } from "@/lib/partner-data";
import { PARTNER_APPLICATION_PATH } from "@/lib/partner-auth";

type GuardState = "loading" | "ready" | "error";

export function PartnerAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GuardState>("loading");
  const [attempt, setAttempt] = useState(0);

  const verifyAccess = useCallback(async () => {
    setState("loading");

    try {
      const session = await getAuthSession();

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

      setState("ready");
    } catch {
      setState("error");
    }
  }, [router]);

  useEffect(() => {
    void verifyAccess();
  }, [verifyAccess, attempt]);

  if (state === "error") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 bg-surface px-4 text-center">
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load your partner dashboard. Please try again.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Retry
          </button>
          <Link
            href={PARTNER_LOGIN_PATH}
            className="text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Back to partner login
          </Link>
        </div>
      </div>
    );
  }

  if (state !== "ready") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-surface">
        <p className="text-sm text-muted-foreground">Loading partner dashboard...</p>
      </div>
    );
  }

  return children;
}
