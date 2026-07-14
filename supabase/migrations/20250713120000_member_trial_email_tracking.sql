-- Track FoodVault lifecycle emails sent to trial members (reminders + trial ended).

alter table public.members
  add column if not exists trial_reminder_3d_sent_at timestamptz,
  add column if not exists trial_reminder_1d_sent_at timestamptz,
  add column if not exists trial_ended_email_sent_at timestamptz;
