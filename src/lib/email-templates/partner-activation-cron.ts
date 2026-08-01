import {
  sendPartnerActivationReminderEmail,
  type PartnerActivationReminderNumber,
} from "@/lib/email-templates/dispatch";
import { createAdminClient } from "@/lib/supabase/admin";

type PartnerActivationEmailProcessResult = {
  reminder1: number;
  reminder2: number;
  reminder3: number;
};

const MS_PER_HOUR = 1000 * 60 * 60;

function hoursSince(timestamp: string, now: Date) {
  const then = new Date(timestamp);
  if (Number.isNaN(then.getTime())) return null;
  return (now.getTime() - then.getTime()) / MS_PER_HOUR;
}

function isPendingActivation(partner: {
  application_status_v2: string | null;
  listing_status_v2: string | null;
}) {
  return (
    String(partner.application_status_v2).toUpperCase() === "APPROVED" &&
    String(partner.listing_status_v2).toUpperCase() !== "LIVE"
  );
}

export async function processPartnerActivationReminderEmails(
  maxEmails = 20
): Promise<PartnerActivationEmailProcessResult> {
  const admin = createAdminClient();
  if (!admin) {
    return { reminder1: 0, reminder2: 0, reminder3: 0 };
  }

  const now = new Date();
  const nowIso = now.toISOString();

  const { data: partners, error } = await admin
    .from("partners")
    .select(
      "id, user_id, business_name, support_email, contact_name, member_code, approved_at, approval_email_sent_at, application_status_v2, listing_status_v2, activation_reminder_1_sent_at, activation_reminder_2_sent_at, activation_reminder_3_sent_at"
    )
    .eq("application_status_v2", "APPROVED")
    .eq("listing_status_v2", "PENDING")
    .not("approved_at", "is", null);

  if (error || !partners?.length) {
    if (error) {
      console.error(
        "[partner-activation-cron] Failed to load pending partners",
        error
      );
    }
    return { reminder1: 0, reminder2: 0, reminder3: 0 };
  }

  let reminder1 = 0;
  let reminder2 = 0;
  let reminder3 = 0;
  let sent = 0;

  for (const partner of partners) {
    if (sent >= maxEmails) break;
    if (!isPendingActivation(partner)) continue;

    const approvedAt = partner.approval_email_sent_at ?? partner.approved_at;
    if (!approvedAt) continue;

    let reminderNumber: PartnerActivationReminderNumber | null = null;

    if (
      !partner.activation_reminder_1_sent_at &&
      (hoursSince(approvedAt, now) ?? 0) >= 24
    ) {
      reminderNumber = 1;
    } else if (
      partner.activation_reminder_1_sent_at &&
      !partner.activation_reminder_2_sent_at &&
      (hoursSince(partner.activation_reminder_1_sent_at, now) ?? 0) >= 24
    ) {
      reminderNumber = 2;
    } else if (
      partner.activation_reminder_2_sent_at &&
      !partner.activation_reminder_3_sent_at &&
      (hoursSince(partner.activation_reminder_2_sent_at, now) ?? 0) >= 48
    ) {
      reminderNumber = 3;
    }

    if (!reminderNumber) continue;

    const result = await sendPartnerActivationReminderEmail({
      partnerId: partner.id,
      reminderNumber,
    });

    if (result.sent !== true) continue;

    const updateField =
      reminderNumber === 1
        ? "activation_reminder_1_sent_at"
        : reminderNumber === 2
          ? "activation_reminder_2_sent_at"
          : "activation_reminder_3_sent_at";

    const { error: updateError } = await admin
      .from("partners")
      .update({ [updateField]: nowIso, updated_at: nowIso })
      .eq("id", partner.id)
      .eq("listing_status_v2", "PENDING");

    if (updateError) {
      console.error("[partner-activation-cron] Failed to record reminder send", {
        partnerId: partner.id,
        reminderNumber,
        updateError,
      });
      continue;
    }

    if (reminderNumber === 1) reminder1 += 1;
    if (reminderNumber === 2) reminder2 += 1;
    if (reminderNumber === 3) reminder3 += 1;
    sent += 1;
  }

  return { reminder1, reminder2, reminder3 };
}
