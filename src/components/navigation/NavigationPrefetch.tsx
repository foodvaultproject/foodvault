"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MEMBER_DASHBOARD_PATH } from "@/lib/auth";
import {
  CONSUMER_EXPLORE_PATH,
  CONSUMER_SEARCH_PATH,
} from "@/lib/consumer-nav-restructure";
import { MEMBER_FAVORITES_PATH } from "@/lib/nav-auth";

const PREFETCH_ROUTES = [
  "/",
  CONSUMER_SEARCH_PATH,
  CONSUMER_EXPLORE_PATH,
  MEMBER_DASHBOARD_PATH,
  MEMBER_FAVORITES_PATH,
  "/partner/listing",
] as const;

export function NavigationPrefetch() {
  const router = useRouter();

  useEffect(() => {
    for (const route of PREFETCH_ROUTES) {
      router.prefetch(route);
    }
  }, [router]);

  return null;
}
