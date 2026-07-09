-- Affiliate Program Phase 6: Notifications, Insights, Health Monitoring & Audit

-- ---------------------------------------------------------------------------
-- Extend notification queue
-- ---------------------------------------------------------------------------

alter table public.affiliate_notification_events
  add column if not exists recipient_type text,
  add column if not exists template_key text,
  add column if not exists email_status text not null default 'pending',
  add column if not exists email_attempts integer not null default 0,
  add column if not exists email_error text,
  add column if not exists in_app_created boolean not null default false;

alter table public.affiliate_notification_events
  drop constraint if exists affiliate_notification_events_type_check;

alter table public.affiliate_notification_events
  add constraint affiliate_notification_events_type_check check (
    event_type in (
      'NEW_AFFILIATE_REGISTERED',
      'CLICK_MILESTONE',
      'FIRST_SALE',
      'FIRST_CLICK',
      'MONTHLY_SUMMARY',
      'AFFILIATE_PAYMENT_SENT',
      'AFFILIATE_WELCOME',
      'COMMISSION_APPROVED',
      'COMMISSION_ADJUSTED',
      'PAYOUT_SCHEDULED',
      'PAYOUT_FAILED',
      'PARTNER_PROGRAM_ENABLED',
      'PARTNER_PROGRAM_DISABLED',
      'STORE_CONNECTED',
      'STORE_DISCONNECTED',
      'INVOICE_GENERATED',
      'PAYMENT_SUCCESS',
      'PAYMENT_FAILED',
      'WEBHOOK_FAILURE'
    )
  );

alter table public.affiliate_notification_events
  drop constraint if exists affiliate_notification_events_email_status_check;

alter table public.affiliate_notification_events
  add constraint affiliate_notification_events_email_status_check check (
    email_status in ('pending', 'sent', 'failed', 'skipped')
  );

create index if not exists affiliate_notification_events_email_pending_idx
  on public.affiliate_notification_events (email_status, created_at)
  where email_status = 'pending';

-- ---------------------------------------------------------------------------
-- In-app notifications (fast UI reads)
-- ---------------------------------------------------------------------------

create table if not exists public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.affiliate_notification_events(id) on delete set null,
  recipient_type text not null,
  partner_id uuid references public.partners(id) on delete cascade,
  affiliate_id uuid references public.affiliates(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint in_app_notifications_recipient_type_check check (
    recipient_type in ('partner', 'affiliate', 'admin')
  )
);

create index if not exists in_app_notifications_partner_idx
  on public.in_app_notifications (partner_id, created_at desc)
  where partner_id is not null;

create index if not exists in_app_notifications_affiliate_idx
  on public.in_app_notifications (affiliate_id, created_at desc)
  where affiliate_id is not null;

create index if not exists in_app_notifications_unread_partner_idx
  on public.in_app_notifications (partner_id)
  where partner_id is not null and read_at is null;

create index if not exists in_app_notifications_unread_affiliate_idx
  on public.in_app_notifications (affiliate_id)
  where affiliate_id is not null and read_at is null;

-- ---------------------------------------------------------------------------
-- Affiliate program audit log
-- ---------------------------------------------------------------------------

create table if not exists public.affiliate_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null,
  actor_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint affiliate_audit_logs_actor_type_check check (
    actor_type in ('system', 'partner', 'affiliate', 'admin')
  )
);

create index if not exists affiliate_audit_logs_created_idx
  on public.affiliate_audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Notification helpers
-- ---------------------------------------------------------------------------

create or replace function public.queue_affiliate_notification(
  p_event_type text,
  p_partner_id uuid default null,
  p_affiliate_id uuid default null,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_recipient_type text;
begin
  v_recipient_type := case
    when p_event_type in (
      'NEW_AFFILIATE_REGISTERED', 'FIRST_SALE', 'FIRST_CLICK', 'CLICK_MILESTONE',
      'PARTNER_PROGRAM_ENABLED', 'PARTNER_PROGRAM_DISABLED', 'STORE_CONNECTED',
      'STORE_DISCONNECTED', 'INVOICE_GENERATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED',
      'WEBHOOK_FAILURE', 'MONTHLY_SUMMARY'
    ) and p_partner_id is not null then 'partner'
    when p_event_type in (
      'AFFILIATE_WELCOME', 'FIRST_SALE', 'FIRST_CLICK', 'CLICK_MILESTONE',
      'COMMISSION_APPROVED', 'COMMISSION_ADJUSTED', 'AFFILIATE_PAYMENT_SENT',
      'PAYOUT_SCHEDULED', 'PAYOUT_FAILED', 'MONTHLY_SUMMARY'
    ) and p_affiliate_id is not null then 'affiliate'
    when p_affiliate_id is not null then 'affiliate'
    when p_partner_id is not null then 'partner'
    else 'admin'
  end;

  insert into public.affiliate_notification_events (
    event_type,
    partner_id,
    affiliate_id,
    payload,
    recipient_type,
    template_key
  ) values (
    p_event_type,
    p_partner_id,
    p_affiliate_id,
    coalesce(p_payload, '{}'::jsonb),
    v_recipient_type,
    lower(p_event_type)
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.get_partner_in_app_notifications(
  p_partner_id uuid,
  p_limit integer default 20
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.partners p where p.id = p_partner_id and p.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  return coalesce((
    select json_agg(row_to_json(t)) from (
      select id, title, body, read_at, created_at
      from public.in_app_notifications
      where partner_id = p_partner_id
      order by created_at desc
      limit greatest(1, least(p_limit, 50))
    ) t
  ), '[]'::json);
end;
$$;

create or replace function public.get_affiliate_in_app_notifications(
  p_affiliate_id uuid,
  p_limit integer default 20
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.affiliates a
    where a.id = p_affiliate_id and a.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  return coalesce((
    select json_agg(row_to_json(t)) from (
      select id, title, body, read_at, created_at
      from public.in_app_notifications
      where affiliate_id = p_affiliate_id
      order by created_at desc
      limit greatest(1, least(p_limit, 50))
    ) t
  ), '[]'::json);
end;
$$;

create or replace function public.get_partner_unread_notification_count(p_partner_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.partners p where p.id = p_partner_id and p.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  return (
    select count(*)::integer
    from public.in_app_notifications
    where partner_id = p_partner_id and read_at is null
  );
end;
$$;

create or replace function public.get_affiliate_unread_notification_count(p_affiliate_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.affiliates a
    where a.id = p_affiliate_id and a.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  return (
    select count(*)::integer
    from public.in_app_notifications
    where affiliate_id = p_affiliate_id and read_at is null
  );
end;
$$;

create or replace function public.mark_in_app_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.in_app_notifications n
  set read_at = now()
  where n.id = p_notification_id
    and (
      (n.partner_id is not null and exists (
        select 1 from public.partners p where p.id = n.partner_id and p.user_id = auth.uid()
      ))
      or (n.affiliate_id is not null and exists (
        select 1 from public.affiliates a where a.id = n.affiliate_id and a.user_id = auth.uid()
      ))
    );
end;
$$;

create or replace function public.mark_all_in_app_notifications_read(
  p_recipient_type text,
  p_partner_id uuid default null,
  p_affiliate_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_recipient_type = 'partner' then
    if not exists (
      select 1 from public.partners p where p.id = p_partner_id and p.user_id = auth.uid()
    ) then
      raise exception 'Unauthorized';
    end if;

    update public.in_app_notifications
    set read_at = now()
    where partner_id = p_partner_id and read_at is null;
  elsif p_recipient_type = 'affiliate' then
    if not exists (
      select 1 from public.affiliates a where a.id = p_affiliate_id and a.user_id = auth.uid()
    ) then
      raise exception 'Unauthorized';
    end if;

    update public.in_app_notifications
    set read_at = now()
    where affiliate_id = p_affiliate_id and read_at is null;
  end if;
end;
$$;

create or replace function public.get_pending_notification_events(p_limit integer default 50)
returns setof public.affiliate_notification_events
language sql
security definer
set search_path = public
as $$
  select *
  from public.affiliate_notification_events
  where sent_at is null
     or email_status = 'pending'
  order by created_at asc
  limit greatest(1, least(p_limit, 200));
$$;

create or replace function public.mark_notification_delivered(
  p_event_id uuid,
  p_email_status text,
  p_email_error text default null,
  p_in_app_title text default null,
  p_in_app_body text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.affiliate_notification_events%rowtype;
begin
  select * into v_event from public.affiliate_notification_events where id = p_event_id;
  if v_event.id is null then
    return;
  end if;

  update public.affiliate_notification_events
  set
    sent_at = coalesce(sent_at, now()),
    email_status = p_email_status,
    email_attempts = email_attempts + case when p_email_status in ('sent', 'failed') then 1 else 0 end,
    email_error = p_email_error,
    in_app_created = true
  where id = p_event_id;

  if p_in_app_title is not null and p_in_app_body is not null then
    if v_event.partner_id is not null and v_event.event_type in (
      'NEW_AFFILIATE_REGISTERED', 'FIRST_SALE', 'FIRST_CLICK', 'CLICK_MILESTONE',
      'PARTNER_PROGRAM_ENABLED', 'PARTNER_PROGRAM_DISABLED', 'STORE_CONNECTED',
      'STORE_DISCONNECTED', 'INVOICE_GENERATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED',
      'WEBHOOK_FAILURE', 'MONTHLY_SUMMARY'
    ) then
      insert into public.in_app_notifications (
        event_id, recipient_type, partner_id, title, body
      ) values (
        p_event_id, 'partner', v_event.partner_id, p_in_app_title, p_in_app_body
      );
    end if;

    if v_event.affiliate_id is not null and v_event.event_type in (
      'FIRST_SALE', 'FIRST_CLICK', 'CLICK_MILESTONE', 'AFFILIATE_WELCOME',
      'COMMISSION_APPROVED', 'COMMISSION_ADJUSTED', 'AFFILIATE_PAYMENT_SENT',
      'PAYOUT_SCHEDULED', 'PAYOUT_FAILED', 'MONTHLY_SUMMARY'
    ) then
      insert into public.in_app_notifications (
        event_id, recipient_type, affiliate_id, title, body
      ) values (
        p_event_id, 'affiliate', v_event.affiliate_id, p_in_app_title, p_in_app_body
      );
    end if;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Click milestone + first click notifications
-- ---------------------------------------------------------------------------

create or replace function public.trg_affiliate_click_notify_milestones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_click_count bigint;
  v_milestone integer;
begin
  select arl.click_count into v_click_count
  from public.affiliate_referral_links arl
  where arl.affiliate_id = new.affiliate_id
    and arl.partner_id = new.partner_id
  order by arl.click_count desc
  limit 1;

  if v_click_count = 1 then
    perform public.queue_affiliate_notification(
      'FIRST_CLICK',
      new.partner_id,
      new.affiliate_id,
      jsonb_build_object('click_count', 1)
    );
  end if;

  foreach v_milestone in array array[100, 1000] loop
    if v_click_count = v_milestone then
      perform public.queue_affiliate_notification(
        'CLICK_MILESTONE',
        new.partner_id,
        new.affiliate_id,
        jsonb_build_object('click_count', v_milestone)
      );
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists affiliate_click_notify_milestones on public.affiliate_click_events;
create trigger affiliate_click_notify_milestones
  after insert on public.affiliate_click_events
  for each row
  execute function public.trg_affiliate_click_notify_milestones();

create or replace function public.trg_affiliate_welcome_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.queue_affiliate_notification(
    'AFFILIATE_WELCOME',
    null,
    new.id,
    jsonb_build_object('email', new.email)
  );
  return new;
end;
$$;

drop trigger if exists affiliate_welcome_notify on public.affiliates;
create trigger affiliate_welcome_notify
  after insert on public.affiliates
  for each row
  execute function public.trg_affiliate_welcome_notify();

-- ---------------------------------------------------------------------------
-- Commission approved notifications
-- ---------------------------------------------------------------------------

create or replace function public.approve_expired_commissions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_count integer := 0;
begin
  for v_row in
    select id, partner_id, affiliate_id, commission_value, currency
    from public.commission_records
    where status = 'pending' and hold_expires_at <= now()
  loop
    update public.commission_records
    set status = 'approved', approved_at = now(), updated_at = now()
    where id = v_row.id;

    perform public.queue_affiliate_notification(
      'COMMISSION_APPROVED',
      v_row.partner_id,
      v_row.affiliate_id,
      jsonb_build_object(
        'commission_id', v_row.id,
        'amount', v_row.commission_value,
        'currency', v_row.currency
      )
    );

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Dashboard insights RPCs
-- ---------------------------------------------------------------------------

create or replace function public.get_partner_affiliate_insights(p_partner_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_clicks_this_month bigint;
  v_clicks_last_month bigint;
  v_orders_this_month bigint;
  v_orders_last_month bigint;
  v_insights jsonb := '[]'::jsonb;
  v_change numeric;
begin
  if not exists (
    select 1 from public.partners p where p.id = p_partner_id and p.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  select count(*) into v_clicks_this_month
  from public.affiliate_click_events ace
  where ace.partner_id = p_partner_id
    and ace.clicked_at >= date_trunc('month', now());

  select count(*) into v_clicks_last_month
  from public.affiliate_click_events ace
  where ace.partner_id = p_partner_id
    and ace.clicked_at >= date_trunc('month', now() - interval '1 month')
    and ace.clicked_at < date_trunc('month', now());

  if v_clicks_last_month > 0 then
    v_change := round(((v_clicks_this_month - v_clicks_last_month)::numeric / v_clicks_last_month) * 100, 1);
    if abs(v_change) >= 5 then
      v_insights := v_insights || jsonb_build_array(jsonb_build_object(
        'type', 'click_growth',
        'title', case when v_change >= 0 then 'Clicks are up this month' else 'Clicks dipped this month' end,
        'body', format('Your affiliate program generated %s%% %s clicks compared to last month.',
          abs(v_change), case when v_change >= 0 then 'more' else 'fewer' end),
        'priority', 1
      ));
    end if;
  elsif v_clicks_this_month > 0 then
    v_insights := v_insights || jsonb_build_array(jsonb_build_object(
      'type', 'first_activity',
      'title', 'Affiliate traffic is live',
      'body', format('Your program recorded %s clicks this month.', v_clicks_this_month),
      'priority', 2
    ));
  end if;

  select count(*) into v_orders_this_month
  from public.commission_records cr
  where cr.partner_id = p_partner_id
    and cr.created_at >= date_trunc('month', now());

  select count(*) into v_orders_last_month
  from public.commission_records cr
  where cr.partner_id = p_partner_id
    and cr.created_at >= date_trunc('month', now() - interval '1 month')
    and cr.created_at < date_trunc('month', now());

  if v_orders_this_month > v_orders_last_month and v_orders_this_month > 0 then
    v_insights := v_insights || jsonb_build_array(jsonb_build_object(
      'type', 'order_growth',
      'title', 'Affiliate sales are growing',
      'body', format('%s attributed orders this month vs %s last month.', v_orders_this_month, v_orders_last_month),
      'priority', 2
    ));
  end if;

  return coalesce(v_insights, '[]'::jsonb)::json;
end;
$$;

create or replace function public.get_affiliate_dashboard_insights(p_affiliate_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_clicks_this_month bigint;
  v_clicks_last_month bigint;
  v_approved numeric;
  v_insights jsonb := '[]'::jsonb;
  v_change numeric;
begin
  if not exists (
    select 1 from public.affiliates a where a.id = p_affiliate_id and a.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  select count(*) into v_clicks_this_month
  from public.affiliate_click_events ace
  where ace.affiliate_id = p_affiliate_id
    and ace.clicked_at >= date_trunc('month', now());

  select count(*) into v_clicks_last_month
  from public.affiliate_click_events ace
  where ace.affiliate_id = p_affiliate_id
    and ace.clicked_at >= date_trunc('month', now() - interval '1 month')
    and ace.clicked_at < date_trunc('month', now());

  if v_clicks_last_month > 0 then
    v_change := round(((v_clicks_this_month - v_clicks_last_month)::numeric / v_clicks_last_month) * 100, 1);
    if abs(v_change) >= 5 then
      v_insights := v_insights || jsonb_build_array(jsonb_build_object(
        'type', 'click_growth',
        'title', case when v_change >= 0 then 'Your reach is growing' else 'Clicks slowed this month' end,
        'body', format('Referral clicks are %s%% %s than last month.',
          abs(v_change), case when v_change >= 0 then 'higher' else 'lower' end),
        'priority', 1
      ));
    end if;
  end if;

  select coalesce(sum(cr.commission_value), 0) into v_approved
  from public.commission_records cr
  where cr.affiliate_id = p_affiliate_id and cr.status = 'approved';

  if v_approved > 0 then
    v_insights := v_insights || jsonb_build_array(jsonb_build_object(
      'type', 'approved_earnings',
      'title', 'Approved earnings ready',
      'body', format('You have $%s in approved commission awaiting payout.', to_char(v_approved, 'FM999,999,990.00')),
      'priority', 2
    ));
  end if;

  return coalesce(v_insights, '[]'::jsonb)::json;
end;
$$;

create or replace function public.get_affiliate_system_health()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_webhook_total bigint;
  v_webhook_failed bigint;
  v_email_pending bigint;
  v_stores_connected bigint;
  v_notification_backlog bigint;
begin
  select count(*), count(*) filter (where status = 'failed')
  into v_webhook_total, v_webhook_failed
  from public.store_webhook_logs
  where created_at >= now() - interval '7 days';

  select count(*) into v_email_pending
  from public.affiliate_notification_events
  where email_status = 'pending';

  select count(*) into v_stores_connected
  from public.store_integrations
  where status = 'connected';

  select count(*) into v_notification_backlog
  from public.affiliate_notification_events
  where sent_at is null;

  return json_build_object(
    'webhook_total_7d', coalesce(v_webhook_total, 0),
    'webhook_failed_7d', coalesce(v_webhook_failed, 0),
    'email_pending', coalesce(v_email_pending, 0),
    'stores_connected', coalesce(v_stores_connected, 0),
    'notification_backlog', coalesce(v_notification_backlog, 0)
  );
end;
$$;

create or replace function public.log_affiliate_audit(
  p_actor_type text,
  p_actor_id uuid,
  p_action text,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  insert into public.affiliate_audit_logs (
    actor_type, actor_id, action, entity_type, entity_id, metadata
  ) values (
    p_actor_type, p_actor_id, p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants & RLS
-- ---------------------------------------------------------------------------

grant execute on function public.get_partner_in_app_notifications(uuid, integer) to authenticated;
grant execute on function public.get_affiliate_in_app_notifications(uuid, integer) to authenticated;
grant execute on function public.get_partner_unread_notification_count(uuid) to authenticated;
grant execute on function public.get_affiliate_unread_notification_count(uuid) to authenticated;
grant execute on function public.mark_in_app_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_in_app_notifications_read(text, uuid, uuid) to authenticated;
grant execute on function public.get_partner_affiliate_insights(uuid) to authenticated;
grant execute on function public.get_affiliate_dashboard_insights(uuid) to authenticated;

grant execute on function public.get_pending_notification_events(integer) to service_role;
grant execute on function public.mark_notification_delivered(uuid, text, text, text, text) to service_role;
grant execute on function public.log_affiliate_audit(text, uuid, text, text, uuid, jsonb) to service_role;
grant execute on function public.get_affiliate_system_health() to service_role;

alter table public.in_app_notifications enable row level security;
alter table public.affiliate_audit_logs enable row level security;

drop policy if exists in_app_notifications_partner on public.in_app_notifications;
create policy in_app_notifications_partner on public.in_app_notifications
  for select using (
    partner_id is not null and exists (
      select 1 from public.partners p where p.id = partner_id and p.user_id = auth.uid()
    )
  );

drop policy if exists in_app_notifications_affiliate on public.in_app_notifications;
create policy in_app_notifications_affiliate on public.in_app_notifications
  for select using (
    affiliate_id is not null and exists (
      select 1 from public.affiliates a where a.id = affiliate_id and a.user_id = auth.uid()
    )
  );

-- pg_cron examples (enable pg_cron in Supabase dashboard first):
-- select cron.schedule('process-notifications', '*/5 * * * *', $$select net.http_post(...)$$);
-- select cron.schedule('approve-expired-commissions', '0 2 * * *', $$select public.approve_expired_commissions();$$);
-- select cron.schedule('generate-partner-invoices', '0 3 1 * *', $$select public.generate_partner_commission_invoices();$$);
-- select cron.schedule('generate-payout-batch', '0 4 1 * *', $$select public.generate_affiliate_payout_batch();$$);
