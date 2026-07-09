"use client";

import { useEffect, useState } from "react";
import { getAuthSession } from "@/lib/auth";
import { getAffiliateRecord } from "@/lib/affiliate/data";
import { NotificationBell } from "@/components/notification-service/NotificationBell";

export function AffiliateNotificationBell() {
  const [affiliateId, setAffiliateId] = useState<string | null>(null);

  useEffect(() => {
    getAuthSession().then(async (session) => {
      if (!session) return;
      const record = await getAffiliateRecord(session.id);
      setAffiliateId(record?.id ?? null);
    });
  }, []);

  if (!affiliateId) return null;

  return <NotificationBell recipientType="affiliate" recipientId={affiliateId} />;
}
