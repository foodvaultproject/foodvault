"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { consumeAuthJustCompleted } from "@/components/auth/AuthCompleteRedirect";
import { isSupabaseConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

/**
 * After Google (or any) auth, the browser session can update before the
 * server-rendered homepage/nav shell catches up. Refresh RSC trees on
 * sign-in/out so members see the correct homepage without a manual reload.
 */
export function AuthSessionRefresh() {
  const router = useRouter();
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const refreshIfNeeded = () => {
      const now = Date.now();
      if (now - lastRefreshAtRef.current < 750) {
        return;
      }
      lastRefreshAtRef.current = now;
      router.refresh();
    };

    if (consumeAuthJustCompleted()) {
      refreshIfNeeded();
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        refreshIfNeeded();
        return;
      }

      // Server-side OAuth (exchangeCodeForSession) lands with INITIAL_SESSION,
      // not SIGNED_IN — refresh once when we know auth just completed.
      if (event === "INITIAL_SESSION" && session && consumeAuthJustCompleted()) {
        refreshIfNeeded();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
