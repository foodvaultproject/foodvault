import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendMemberFreeTrialEndedEmail,
  sendMemberFreeTrialReminderEmail,
} from "@/lib/email-templates/dispatch";

type TrialEmailProcessResult = {
  reminder3d: number;
  reminder1d: number;
  ended: number;
};

function daysUntilTrialEnd(trialEndsAt: string, now = new Date()) {
  const end = new Date(trialEndsAt);
  if (Number.isNaN(end.getTime())) return null;

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfEndDay = new Date(end);
  startOfEndDay.setHours(0, 0, 0, 0);

  const diffMs = startOfEndDay.getTime() - startOfToday.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export async function processMemberTrialEmails(): Promise<TrialEmailProcessResult> {
  const admin = createAdminClient();
  if (!admin) {
    return { reminder3d: 0, reminder1d: 0, ended: 0 };
  }

  const now = new Date();
  const nowIso = now.toISOString();

  const { data: members, error } = await admin
    .from("members")
    .select(
      "id, auth_user_id, email, first_name, trial_ends_at, membership_status, status, stripe_subscription_id, trial_reminder_3d_sent_at, trial_reminder_1d_sent_at, trial_ended_email_sent_at"
    )
    .or("membership_status.eq.trialing,status.eq.TRIAL")
    .not("trial_ends_at", "is", null);

  if (error || !members?.length) {
    if (error) {
      console.error("[trial-email-cron] Failed to load trial members", error);
    }
    return { reminder3d: 0, reminder1d: 0, ended: 0 };
  }

  let reminder3d = 0;
  let reminder1d = 0;
  let ended = 0;

  for (const member of members) {
    const email = member.email?.trim();
    const trialEndsAt = member.trial_ends_at;
    if (!email || !trialEndsAt) continue;

    if (member.stripe_subscription_id) continue;

    const daysRemaining = daysUntilTrialEnd(trialEndsAt, now);
    if (daysRemaining == null) continue;

    const memberId = member.auth_user_id ?? member.id;

    if (daysRemaining === 3 && !member.trial_reminder_3d_sent_at) {
      const result = await sendMemberFreeTrialReminderEmail({
        to: email,
        firstName: member.first_name,
        daysRemaining: 3,
      });

      if (result.sent) {
        await admin
          .from("members")
          .update({ trial_reminder_3d_sent_at: nowIso })
          .or(`auth_user_id.eq.${memberId},id.eq.${memberId}`);
        reminder3d += 1;
      }
    }

    if (daysRemaining === 1 && !member.trial_reminder_1d_sent_at) {
      const result = await sendMemberFreeTrialReminderEmail({
        to: email,
        firstName: member.first_name,
        daysRemaining: 1,
      });

      if (result.sent) {
        await admin
          .from("members")
          .update({ trial_reminder_1d_sent_at: nowIso })
          .or(`auth_user_id.eq.${memberId},id.eq.${memberId}`);
        reminder1d += 1;
      }
    }

    if (daysRemaining < 0 && !member.trial_ended_email_sent_at) {
      const result = await sendMemberFreeTrialEndedEmail({
        to: email,
        firstName: member.first_name,
      });

      if (result.sent) {
        await admin
          .from("members")
          .update({ trial_ended_email_sent_at: nowIso })
          .or(`auth_user_id.eq.${memberId},id.eq.${memberId}`);
        ended += 1;
      }
    }
  }

  return { reminder3d, reminder1d, ended };
}
