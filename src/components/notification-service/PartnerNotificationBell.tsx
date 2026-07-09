"use client";

import { usePartnerOnboarding } from "@/components/partner-portal/PartnerOnboardingProvider";
import { NotificationBell } from "@/components/notification-service/NotificationBell";

export function PartnerNotificationBell() {
  const { partner } = usePartnerOnboarding();

  if (!partner) return null;

  return <NotificationBell recipientType="partner" recipientId={partner.id} />;
}
