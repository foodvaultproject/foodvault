"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
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

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") {
        return;
      }

      const now = Date.now();
      // Avoid back-to-back refreshes from duplicate auth emissions.
      if (now - lastRefreshAtRef.current < 750) {
        return;
      }
      lastRefreshAtRef.current = now;

      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
