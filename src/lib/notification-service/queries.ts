import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/auth";
import {
  mapDashboardInsights,
  mapInAppNotifications,
} from "@/lib/notification-service/mappers";
import type { DashboardInsight, InAppNotification } from "@/lib/notification-service/types";

export async function getPartnerInAppNotifications(
  partnerId: string
): Promise<InAppNotification[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_in_app_notifications", {
    p_partner_id: partnerId,
    p_limit: 20,
  });

  if (error) return [];
  return mapInAppNotifications(data);
}

export async function getAffiliateInAppNotifications(
  affiliateId: string
): Promise<InAppNotification[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_affiliate_in_app_notifications", {
    p_affiliate_id: affiliateId,
    p_limit: 20,
  });

  if (error) return [];
  return mapInAppNotifications(data);
}

export async function getPartnerUnreadNotificationCount(partnerId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_unread_notification_count", {
    p_partner_id: partnerId,
  });

  if (error) return 0;
  return Number(data ?? 0);
}

export async function getAffiliateUnreadNotificationCount(affiliateId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_affiliate_unread_notification_count", {
    p_affiliate_id: affiliateId,
  });

  if (error) return 0;
  return Number(data ?? 0);
}

export async function markInAppNotificationRead(notificationId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  await supabase.rpc("mark_in_app_notification_read", {
    p_notification_id: notificationId,
  });
}

export async function markAllInAppNotificationsRead(input: {
  recipientType: "partner" | "affiliate";
  partnerId?: string;
  affiliateId?: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  await supabase.rpc("mark_all_in_app_notifications_read", {
    p_recipient_type: input.recipientType,
    p_partner_id: input.partnerId ?? null,
    p_affiliate_id: input.affiliateId ?? null,
  });
}

export async function getPartnerAffiliateInsights(partnerId: string): Promise<DashboardInsight[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_partner_affiliate_insights", {
    p_partner_id: partnerId,
  });

  if (error) return [];
  return mapDashboardInsights(data);
}

export async function getAffiliateDashboardInsights(
  affiliateId: string
): Promise<DashboardInsight[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_affiliate_dashboard_insights", {
    p_affiliate_id: affiliateId,
  });

  if (error) return [];
  return mapDashboardInsights(data);
}
