"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { finalizeVerifiedSessionAction } from "@/lib/auth/finalize-verified-session";
import {
  consumePartnerOAuthSignup,
  isPartnerOAuthNextPath,
} from "@/lib/auth/oauth-intent-client";

const AUTH_JUST_COMPLETED_KEY = "fv-auth-just-completed";

/** Marks that the browser should refresh RSC trees once after the next load. */
export function markAuthJustCompleted() {
  try {
    sessionStorage.setItem(AUTH_JUST_COMPLETED_KEY, "1");
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

export function consumeAuthJustCompleted() {
  try {
    if (sessionStorage.getItem(AUTH_JUST_COMPLETED_KEY) !== "1") {
      return false;
    }
    sessionStorage.removeItem(AUTH_JUST_COMPLETED_KEY);
    return true;
  } catch {
    return false;
  }
}

export function AuthCompleteRedirect() {
  const searchParams = useSearchParams();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current) {
      return;
    }
    redirectedRef.current = true;

    const next = searchParams.get("next");
    const target = next?.startsWith("/") ? next : "/";

    void (async () => {
      if (isPartnerOAuthNextPath(target) || consumePartnerOAuthSignup()) {
        await finalizeVerifiedSessionAction("partner");
      }

      markAuthJustCompleted();
      window.location.replace(target);
    })();
  }, [searchParams]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-page px-4">
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  );
}
