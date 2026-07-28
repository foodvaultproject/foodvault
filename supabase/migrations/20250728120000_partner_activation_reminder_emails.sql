-- Track partner activation reminder emails for approved listings pending go-live.

alter table public.partners
  add column if not exists approval_email_sent_at timestamptz,
  add column if not exists activation_reminder_1_sent_at timestamptz,
  add column if not exists activation_reminder_2_sent_at timestamptz,
  add column if not exists activation_reminder_3_sent_at timestamptz;

comment on column public.partners.approval_email_sent_at is
  'When the initial application-approved email was sent to the partner.';
comment on column public.partners.activation_reminder_1_sent_at is
  'First activation reminder — 24 hours after approval email.';
comment on column public.partners.activation_reminder_2_sent_at is
  'Second activation reminder — 24 hours after reminder 1.';
comment on column public.partners.activation_reminder_3_sent_at is
  'Final activation reminder — 48 hours after reminder 2.';

create index if not exists partners_pending_activation_reminders_idx
  on public.partners (approved_at)
  where application_status_v2 = 'APPROVED'
    and listing_status_v2 = 'PENDING';
