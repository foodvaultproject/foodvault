import { createAdminClient } from "@/lib/supabase/admin";
import { getNotificationServiceConfig } from "@/lib/notification-service/config";
import { sendResendEmail } from "@/lib/notification-service/providers/resend";
import { renderNotification } from "@/lib/notification-service/templates";
import { logAffiliateAudit } from "@/lib/audit-service";
import type {
  AffiliateSystemHealth,
  NotificationEventRow,
  NotificationEventType,
} from "@/lib/notification-service/types";

const DUAL_RECIPIENT_EVENTS: NotificationEventType[] = ["FIRST_SALE", "FIRST_CLICK"];

async function resolveRecipientEmails(event: NotificationEventRow) {
  const admin = createAdminClient();
  if (!admin) return { partnerEmail: null as string | null, affiliateEmail: null as string | null };

  let partnerEmail: string | null = null;
  let affiliateEmail: string | null = null;

  if (event.partner_id) {
    const { data: partner } = await admin
      .from("partners")
      .select("user_id, support_email")
      .eq("id", event.partner_id)
      .maybeSingle();

    if (partner?.support_email) {
      partnerEmail = String(partner.support_email);
    } else if (partner?.user_id) {
      const { data: userData } = await admin.auth.admin.getUserById(String(partner.user_id));
      partnerEmail = userData.user?.email ?? null;
    }
  }

  if (event.affiliate_id) {
    const { data: affiliate } = await admin
      .from("affiliates")
      .select("email")
      .eq("id", event.affiliate_id)
      .maybeSingle();
    affiliateEmail = affiliate?.email ? String(affiliate.email) : null;
  }

  return { partnerEmail, affiliateEmail };
}

async function markDelivered(
  eventId: string,
  emailStatus: "sent" | "failed" | "skipped",
  title: string,
  body: string,
  emailError?: string | null
) {
  const admin = createAdminClient();
  if (!admin) return;

  await admin.rpc("mark_notification_delivered", {
    p_event_id: eventId,
    p_email_status: emailStatus,
    p_email_error: emailError ?? null,
    p_in_app_title: title,
    p_in_app_body: body,
  });

  await logAffiliateAudit({
    actorType: "system",
    action: "notification_sent",
    entityType: "affiliate_notification_event",
    entityId: eventId,
    metadata: { email_status: emailStatus, title },
  });
}

export async function deliverNotificationEvent(event: NotificationEventRow) {
  const rendered = renderNotification(event);
  if (!rendered) {
    await markDelivered(event.id, "skipped", "Notification", "Update available.", null);
    return;
  }

  const { isConfigured } = getNotificationServiceConfig();
  const { partnerEmail, affiliateEmail } = await resolveRecipientEmails(event);

  const targets: { email: string | null; recipient: "partner" | "affiliate" }[] = [];

  if (DUAL_RECIPIENT_EVENTS.includes(event.event_type)) {
    targets.push({ email: partnerEmail, recipient: "partner" });
    targets.push({ email: affiliateEmail, recipient: "affiliate" });
  } else if (event.recipient_type === "affiliate") {
    targets.push({ email: affiliateEmail, recipient: "affiliate" });
  } else {
    targets.push({ email: partnerEmail, recipient: "partner" });
  }

  if (!isConfigured) {
    await markDelivered(event.id, "skipped", rendered.title, rendered.body, "Resend not configured");
    return;
  }

  let sentAny = false;
  let lastError: string | null = null;

  for (const target of targets) {
    if (!target.email) continue;

    try {
      await sendResendEmail({
        to: target.email,
        subject: rendered.subject,
        html: rendered.html,
      });
      sentAny = true;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Email delivery failed";
    }
  }

  await markDelivered(
    event.id,
    sentAny ? "sent" : "failed",
    rendered.title,
    rendered.body,
    lastError
  );
}

export async function processPendingNotifications(limit = 50) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Admin client unavailable");

  const { data, error } = await admin.rpc("get_pending_notification_events", {
    p_limit: limit,
  });

  if (error) {
    throw new Error(error.message);
  }

  const events = (data ?? []) as NotificationEventRow[];
  let processed = 0;

  for (const event of events) {
    if (event.email_attempts >= 5) {
      await markDelivered(event.id, "failed", "Notification", "Delivery failed.", "Max attempts reached");
      continue;
    }

    await deliverNotificationEvent(event);
    processed += 1;
  }

  return processed;
}

export async function queueNotification(input: {
  eventType: NotificationEventType;
  partnerId?: string | null;
  affiliateId?: string | null;
  payload?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.rpc("queue_affiliate_notification", {
    p_event_type: input.eventType,
    p_partner_id: input.partnerId ?? null,
    p_affiliate_id: input.affiliateId ?? null,
    p_payload: input.payload ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

export async function getAffiliateSystemHealth(): Promise<AffiliateSystemHealth> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      webhookTotal7d: 0,
      webhookFailed7d: 0,
      emailPending: 0,
      storesConnected: 0,
      notificationBacklog: 0,
    };
  }

  const { data } = await admin.rpc("get_affiliate_system_health");
  const row = (data ?? {}) as Record<string, unknown>;

  return {
    webhookTotal7d: Number(row.webhook_total_7d ?? 0),
    webhookFailed7d: Number(row.webhook_failed_7d ?? 0),
    emailPending: Number(row.email_pending ?? 0),
    storesConnected: Number(row.stores_connected ?? 0),
    notificationBacklog: Number(row.notification_backlog ?? 0),
  };
}
