-- Affiliate Program Production Hardening (Pre-Launch)

-- ---------------------------------------------------------------------------
-- Fraud flags
-- ---------------------------------------------------------------------------

create table if not exists public.affiliate_fraud_flags (
  id uuid primary key default gen_random_uuid(),
  flag_type text not null,
  status text not null default 'open',
  affiliate_id uuid references public.affiliates(id) on delete set null,
  partner_id uuid references public.partners(id) on delete set null,
  click_event_id uuid references public.affiliate_click_events(id) on delete set null,
  ip_hash text,
  click_count integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.admin_users(id) on delete set null,
  constraint affiliate_fraud_flags_status_check check (
    status in ('open', 'dismissed', 'investigated')
  ),
  constraint affiliate_fraud_flags_type_check check (
    flag_type in (
      'click_spike',
      'repeat_ip',
      'rapid_clicks',
      'possible_self_referral',
      'abnormal_traffic'
    )
  )
);

create index if not exists affiliate_fraud_flags_status_idx
  on public.affiliate_fraud_flags (status, created_at desc);

create index if not exists affiliate_fraud_flags_affiliate_idx
  on public.affiliate_fraud_flags (affiliate_id, created_at desc);

alter table public.affiliate_click_events
  add column if not exists ip_hash text;

create index if not exists affiliate_click_events_ip_hash_idx
  on public.affiliate_click_events (ip_hash, clicked_at desc)
  where ip_hash is not null;

-- ---------------------------------------------------------------------------
-- Scheduled job run tracking
-- ---------------------------------------------------------------------------

create table if not exists public.scheduled_job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  result jsonb not null default '{}'::jsonb,
  error_message text,
  constraint scheduled_job_runs_status_check check (
    status in ('running', 'success', 'failed')
  )
);

create index if not exists scheduled_job_runs_job_name_idx
  on public.scheduled_job_runs (job_name, started_at desc);

-- ---------------------------------------------------------------------------
-- Audit log immutability
-- ---------------------------------------------------------------------------

create or replace function public.trg_prevent_affiliate_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Affiliate audit logs are immutable';
end;
$$;

drop trigger if exists affiliate_audit_logs_no_update on public.affiliate_audit_logs;
create trigger affiliate_audit_logs_no_update
  before update or delete on public.affiliate_audit_logs
  for each row execute function public.trg_prevent_affiliate_audit_mutation();

-- ---------------------------------------------------------------------------
-- Fraud flag helper
-- ---------------------------------------------------------------------------

create or replace function public.create_affiliate_fraud_flag(
  p_flag_type text,
  p_affiliate_id uuid default null,
  p_partner_id uuid default null,
  p_click_event_id uuid default null,
  p_ip_hash text default null,
  p_click_count integer default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  insert into public.affiliate_fraud_flags (
    flag_type, affiliate_id, partner_id, click_event_id, ip_hash, click_count, metadata
  ) values (
    p_flag_type, p_affiliate_id, p_partner_id, p_click_event_id, p_ip_hash, p_click_count,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  perform public.log_affiliate_audit(
    'system', null, 'fraud_flag_created', 'affiliate_fraud_flag', v_id,
    jsonb_build_object(
      'flag_type', p_flag_type,
      'affiliate_id', p_affiliate_id,
      'partner_id', p_partner_id,
      'click_event_id', p_click_event_id
    )
  );

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Rate limiting + fraud detection in click recording
-- ---------------------------------------------------------------------------

drop function if exists public.record_affiliate_click(text, text, text, text, text);

create or replace function public.record_affiliate_click(
  p_brand_slug text,
  p_affiliate_code text,
  p_device text default null,
  p_referrer text default null,
  p_user_agent text default null,
  p_ip_hash text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.affiliate_referral_links%rowtype;
  v_partner public.partners%rowtype;
  v_affiliate public.affiliates%rowtype;
  v_click_id uuid;
  v_session_token text;
  v_cookie_days integer;
  v_redirect_url text;
  v_ip_minute_count integer := 0;
  v_ip_hour_count integer := 0;
  v_affiliate_hour_count integer := 0;
  v_repeat_ip_hour integer := 0;
begin
  if p_ip_hash is not null and trim(p_ip_hash) <> '' then
    select count(*) into v_ip_minute_count
    from public.affiliate_click_events
    where ip_hash = p_ip_hash and clicked_at > now() - interval '1 minute';

    if v_ip_minute_count >= 60 then
      return json_build_object('rate_limited', true, 'reason', 'minute_limit');
    end if;

    select count(*) into v_ip_hour_count
    from public.affiliate_click_events
    where ip_hash = p_ip_hash and clicked_at > now() - interval '10 seconds';

    if v_ip_hour_count >= 15 then
      return json_build_object('rate_limited', true, 'reason', 'burst_limit');
    end if;
  end if;

  select l.* into v_link
  from public.affiliate_referral_links l
  join public.affiliates a on a.id = l.affiliate_id
  join public.partners p on p.id = l.partner_id
  where lower(p.slug) = lower(trim(p_brand_slug))
    and upper(a.referral_code) = upper(trim(p_affiliate_code))
    and a.status = 'ACTIVE'
    and p.affiliate_enabled = true
  limit 1;

  if v_link.id is null then
    return null;
  end if;

  select * into v_partner from public.partners where id = v_link.partner_id;
  select * into v_affiliate from public.affiliates where id = v_link.affiliate_id;

  insert into public.affiliate_click_events (
    affiliate_id, partner_id, referral_link_id, device, referrer, user_agent, ip_hash
  ) values (
    v_link.affiliate_id, v_link.partner_id, v_link.id, p_device, p_referrer, p_user_agent, p_ip_hash
  )
  returning id into v_click_id;

  perform public.log_affiliate_audit(
    'system', null, 'referral_click', 'affiliate_click_event', v_click_id,
    jsonb_build_object(
      'affiliate_id', v_link.affiliate_id,
      'partner_id', v_link.partner_id,
      'referral_link_id', v_link.id,
      'ip_hash', p_ip_hash
    )
  );

  if v_partner.user_id is not null and v_affiliate.user_id is not null
     and v_partner.user_id = v_affiliate.user_id then
    perform public.create_affiliate_fraud_flag(
      'possible_self_referral', v_link.affiliate_id, v_link.partner_id, v_click_id, p_ip_hash, 1,
      jsonb_build_object('partner_user_id', v_partner.user_id)
    );
  end if;

  if p_ip_hash is not null then
    select count(*) into v_repeat_ip_hour
    from public.affiliate_click_events
    where ip_hash = p_ip_hash
      and affiliate_id = v_link.affiliate_id
      and clicked_at > now() - interval '1 hour';

    if v_repeat_ip_hour >= 25 then
      perform public.create_affiliate_fraud_flag(
        'repeat_ip', v_link.affiliate_id, v_link.partner_id, v_click_id, p_ip_hash, v_repeat_ip_hour,
        jsonb_build_object('window', '1 hour')
      );
    end if;
  end if;

  select count(*) into v_affiliate_hour_count
  from public.affiliate_click_events
  where affiliate_id = v_link.affiliate_id
    and partner_id = v_link.partner_id
    and clicked_at > now() - interval '1 hour';

  if v_affiliate_hour_count >= 100 then
    perform public.create_affiliate_fraud_flag(
      'click_spike', v_link.affiliate_id, v_link.partner_id, v_click_id, p_ip_hash, v_affiliate_hour_count,
      jsonb_build_object('window', '1 hour')
    );
  elsif v_affiliate_hour_count >= 50 then
    perform public.create_affiliate_fraud_flag(
      'abnormal_traffic', v_link.affiliate_id, v_link.partner_id, v_click_id, p_ip_hash, v_affiliate_hour_count,
      jsonb_build_object('window', '1 hour')
    );
  end if;

  if p_ip_hash is not null then
    select count(*) into v_ip_hour_count
    from public.affiliate_click_events
    where ip_hash = p_ip_hash and clicked_at > now() - interval '1 minute';

    if v_ip_hour_count >= 8 then
      perform public.create_affiliate_fraud_flag(
        'rapid_clicks', v_link.affiliate_id, v_link.partner_id, v_click_id, p_ip_hash, v_ip_hour_count,
        jsonb_build_object('window', '1 minute')
      );
    end if;
  end if;

  v_cookie_days := coalesce(v_partner.affiliate_cookie_duration_days, 30);
  v_session_token := encode(gen_random_bytes(16), 'hex');

  insert into public.affiliate_attribution_sessions (
    session_token, referral_link_id, affiliate_id, partner_id, click_event_id, expires_at
  ) values (
    v_session_token, v_link.id, v_link.affiliate_id, v_link.partner_id, v_click_id,
    now() + make_interval(days => v_cookie_days)
  );

  v_redirect_url := v_partner.website_url;
  if v_redirect_url is not null and trim(v_redirect_url) <> '' then
    if position('?' in v_redirect_url) > 0 then
      v_redirect_url := v_redirect_url || '&fv_ref=' || v_session_token;
    else
      v_redirect_url := v_redirect_url || '?fv_ref=' || v_session_token;
    end if;
  end if;

  perform public.log_affiliate_audit(
    'system', null, 'referral_redirect', 'affiliate_attribution_session', v_click_id,
    jsonb_build_object('redirect_url', v_redirect_url, 'session_token', v_session_token)
  );

  return json_build_object(
    'website_url', v_partner.website_url,
    'redirect_url', v_redirect_url,
    'session_token', v_session_token,
    'cookie_duration_days', v_cookie_days,
    'click_id', v_click_id
  );
end;
$$;

grant execute on function public.record_affiliate_click(text, text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Referral link path sync on slug change
-- ---------------------------------------------------------------------------

create or replace function public.sync_affiliate_referral_link_paths_for_partner(p_partner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_slug text;
begin
  select slug into v_slug from public.partners where id = p_partner_id;
  if v_slug is null or v_slug = '' then return; end if;

  update public.affiliate_referral_links arl
  set link_path = v_slug || '/' || a.referral_code
  from public.affiliates a
  where arl.partner_id = p_partner_id and arl.affiliate_id = a.id;
end;
$$;

create or replace function public.trg_partners_sync_affiliate_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.affiliate_enabled is true
    and (tg_op = 'INSERT' or old.affiliate_enabled is distinct from new.affiliate_enabled) then
    perform public.sync_affiliate_referral_links_for_partner(new.id);
  end if;

  if tg_op = 'UPDATE' and old.slug is distinct from new.slug then
    perform public.sync_affiliate_referral_link_paths_for_partner(new.id);
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- DB-level audit triggers for financial lifecycle
-- ---------------------------------------------------------------------------

create or replace function public.trg_audit_affiliate_registered()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_affiliate_audit(
    'affiliate', new.user_id, 'affiliate_registered', 'affiliate', new.id,
    jsonb_build_object('email', new.email, 'referral_code', new.referral_code)
  );
  return new;
end; $$;

drop trigger if exists audit_affiliate_registered on public.affiliates;
create trigger audit_affiliate_registered
  after insert on public.affiliates
  for each row execute function public.trg_audit_affiliate_registered();

create or replace function public.trg_audit_referral_link_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_affiliate_audit(
    'system', null, 'referral_link_created', 'affiliate_referral_link', new.id,
    jsonb_build_object('affiliate_id', new.affiliate_id, 'partner_id', new.partner_id, 'link_path', new.link_path)
  );
  return new;
end; $$;

drop trigger if exists audit_referral_link_created on public.affiliate_referral_links;
create trigger audit_referral_link_created
  after insert on public.affiliate_referral_links
  for each row execute function public.trg_audit_referral_link_created();

create or replace function public.trg_audit_commission_lifecycle()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_action text;
begin
  if tg_op = 'INSERT' then
    v_action := 'commission_created';
  elsif new.status is distinct from old.status then
    v_action := case new.status
      when 'approved' then 'commission_approved'
      when 'cancelled' then 'commission_cancelled'
      when 'refunded' then 'commission_refunded'
      when 'paid' then 'affiliate_payout'
      else 'commission_updated'
    end;
  else
    return new;
  end if;

  perform public.log_affiliate_audit(
    'system', null, v_action, 'commission_record', new.id,
    jsonb_build_object(
      'partner_id', new.partner_id,
      'affiliate_id', new.affiliate_id,
      'order_id', new.order_id,
      'status', new.status,
      'commission_value', new.commission_value,
      'currency', new.currency
    )
  );
  return new;
end; $$;

drop trigger if exists audit_commission_lifecycle on public.commission_records;
create trigger audit_commission_lifecycle
  after insert or update of status on public.commission_records
  for each row execute function public.trg_audit_commission_lifecycle();

create or replace function public.trg_audit_billing_invoice()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_affiliate_audit(
      'system', null, 'invoice_generated', 'billing_invoice', new.id,
      jsonb_build_object('partner_id', new.partner_id, 'amount', new.gross_commission, 'currency', new.currency)
    );
  elsif new.status is distinct from old.status and new.status = 'paid' then
    perform public.log_affiliate_audit(
      'system', null, 'partner_charged', 'billing_invoice', new.id,
      jsonb_build_object('partner_id', new.partner_id, 'external_payment_intent_id', new.external_payment_intent_id)
    );
  elsif new.status is distinct from old.status and new.status = 'failed' then
    perform public.log_affiliate_audit(
      'system', null, 'payment_failed', 'billing_invoice', new.id,
      jsonb_build_object('partner_id', new.partner_id, 'failure_message', new.failure_message)
    );
  end if;
  return new;
end; $$;

drop trigger if exists audit_billing_invoice on public.billing_invoices;
create trigger audit_billing_invoice
  after insert or update of status on public.billing_invoices
  for each row execute function public.trg_audit_billing_invoice();

create or replace function public.trg_audit_store_integration()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_action text;
begin
  if tg_op = 'INSERT' and new.status = 'connected' then
    v_action := 'store_connected';
  elsif tg_op = 'UPDATE' and new.status = 'disconnected' and old.status is distinct from new.status then
    v_action := 'store_disconnected';
  else
    return new;
  end if;

  perform public.log_affiliate_audit(
    'system', null, v_action, 'store_integration', new.id,
    jsonb_build_object('partner_id', new.partner_id, 'platform', new.platform, 'store_name', new.store_name)
  );
  return new;
end; $$;

drop trigger if exists audit_store_integration on public.store_integrations;
create trigger audit_store_integration
  after insert or update of status on public.store_integrations
  for each row execute function public.trg_audit_store_integration();

-- ---------------------------------------------------------------------------
-- Commission export RPCs (RLS-safe)
-- ---------------------------------------------------------------------------

create or replace function public.get_affiliate_commission_export(p_affiliate_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.affiliates a where a.id = p_affiliate_id and a.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  return coalesce((
    select json_agg(row_to_json(t)) from (
      select
        cr.created_at,
        cr.gross_sale,
        cr.commission_value,
        cr.currency,
        cr.status,
        cr.approved_at,
        cr.paid_at,
        p.business_name as brand_name
      from public.commission_records cr
      join public.partners p on p.id = cr.partner_id
      where cr.affiliate_id = p_affiliate_id
      order by cr.created_at desc
    ) t
  ), '[]'::json);
end;
$$;

create or replace function public.get_partner_commission_export(p_partner_id uuid)
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
      select
        cr.created_at,
        a.first_name,
        a.last_name,
        a.email,
        cr.gross_sale,
        cr.commission_value,
        cr.currency,
        cr.status,
        cr.approved_at,
        cr.paid_at
      from public.commission_records cr
      join public.affiliates a on a.id = cr.affiliate_id
      where cr.partner_id = p_partner_id
      order by cr.created_at desc
    ) t
  ), '[]'::json);
end;
$$;

grant execute on function public.get_affiliate_commission_export(uuid) to authenticated;
grant execute on function public.get_partner_commission_export(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin fraud review
-- ---------------------------------------------------------------------------

create or replace function public.admin_get_fraud_flags(
  p_status text default null,
  p_limit integer default 100
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  return coalesce((
    select json_agg(row_to_json(t)) from (
      select
        f.id,
        f.flag_type,
        f.status,
        f.click_count,
        f.ip_hash,
        f.created_at,
        f.reviewed_at,
        a.first_name as affiliate_first_name,
        a.last_name as affiliate_last_name,
        a.email as affiliate_email,
        p.business_name as brand_name,
        f.affiliate_id,
        f.partner_id
      from public.affiliate_fraud_flags f
      left join public.affiliates a on a.id = f.affiliate_id
      left join public.partners p on p.id = f.partner_id
      where p_status is null or f.status = p_status
      order by f.created_at desc
      limit greatest(1, least(p_limit, 500))
    ) t
  ), '[]'::json);
end;
$$;

create or replace function public.admin_update_fraud_flag_status(
  p_flag_id uuid,
  p_status text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_admin_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  select id into v_admin_id from public.admin_users where auth_user_id = auth.uid();

  update public.affiliate_fraud_flags
  set
    status = p_status,
    reviewed_at = now(),
    reviewed_by = v_admin_id,
    metadata = metadata || jsonb_build_object('review_notes', coalesce(p_notes, ''))
  where id = p_flag_id;

  perform public.log_affiliate_audit(
    'admin', v_admin_id,
    case when p_status = 'dismissed' then 'fraud_flag_dismissed'
         when p_status = 'investigated' then 'fraud_flag_investigated'
         else 'fraud_flag_reviewed' end,
    'affiliate_fraud_flag', p_flag_id,
    jsonb_build_object('status', p_status, 'notes', p_notes)
  );
end;
$$;

grant execute on function public.admin_get_fraud_flags(text, integer) to authenticated;
grant execute on function public.admin_update_fraud_flag_status(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Scheduled job helpers
-- ---------------------------------------------------------------------------

create or replace function public.record_scheduled_job_run(
  p_job_name text,
  p_status text,
  p_result jsonb default '{}'::jsonb,
  p_error_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  insert into public.scheduled_job_runs (job_name, status, finished_at, result, error_message)
  values (p_job_name, p_status, now(), coalesce(p_result, '{}'::jsonb), p_error_message)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.get_scheduled_job_status(p_job_name text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_last public.scheduled_job_runs%rowtype;
begin
  select * into v_last
  from public.scheduled_job_runs
  where job_name = p_job_name
  order by started_at desc
  limit 1;

  if v_last.id is null then
    return json_build_object('job_name', p_job_name, 'last_run', null);
  end if;

  return json_build_object(
    'job_name', p_job_name,
    'last_run', v_last.started_at,
    'last_status', v_last.status,
    'last_error', v_last.error_message,
    'result', v_last.result
  );
end;
$$;

grant execute on function public.record_scheduled_job_run(text, text, jsonb, text) to service_role;
grant execute on function public.get_scheduled_job_status(text) to service_role;

-- ---------------------------------------------------------------------------
-- Platform health dashboard (admin)
-- ---------------------------------------------------------------------------

create or replace function public.get_platform_health_dashboard()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_webhook_total bigint;
  v_webhook_failed bigint;
  v_webhook_last_success timestamptz;
  v_stores_connected bigint;
  v_stores_failed bigint;
  v_email_pending bigint;
  v_email_failed bigint;
  v_notification_backlog bigint;
  v_pending_commissions bigint;
  v_pending_payouts bigint;
  v_open_fraud_flags bigint;
  v_failed_invoices bigint;
  v_pending_charges bigint;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  select count(*), count(*) filter (where status = 'failed')
  into v_webhook_total, v_webhook_failed
  from public.store_webhook_logs where created_at >= now() - interval '7 days';

  select max(processed_at) into v_webhook_last_success
  from public.store_webhook_logs where status = 'processed';

  select count(*) into v_stores_connected from public.store_integrations where status = 'connected';
  select count(*) into v_stores_failed from public.store_integrations where status = 'error';

  select count(*) into v_email_pending from public.affiliate_notification_events where email_status = 'pending';
  select count(*) into v_email_failed from public.affiliate_notification_events where email_status = 'failed';

  select count(*) into v_notification_backlog from public.affiliate_notification_events where sent_at is null;

  select count(*) into v_pending_commissions from public.commission_records where status = 'pending';
  select count(*) into v_pending_payouts from public.payout_items where status = 'pending';

  select count(*) into v_open_fraud_flags from public.affiliate_fraud_flags where status = 'open';

  select count(*) into v_failed_invoices from public.billing_invoices where status = 'failed';
  select count(*) into v_pending_charges from public.billing_invoices where status = 'open';

  return json_build_object(
    'store_integration', json_build_object(
      'connected_stores', coalesce(v_stores_connected, 0),
      'failed_connections', coalesce(v_stores_failed, 0),
      'shopify_api', case when coalesce(v_stores_failed, 0) > 0 then 'warning' else 'healthy' end
    ),
    'payments', json_build_object(
      'pending_charges', coalesce(v_pending_charges, 0),
      'failed_charges', coalesce(v_failed_invoices, 0),
      'stripe', case when coalesce(v_failed_invoices, 0) > 0 then 'action_required' else 'healthy' end
    ),
    'notifications', json_build_object(
      'queue_size', coalesce(v_notification_backlog, 0),
      'failed_emails', coalesce(v_email_failed, 0),
      'pending_emails', coalesce(v_email_pending, 0),
      'status', case
        when coalesce(v_email_failed, 0) > 10 then 'action_required'
        when coalesce(v_notification_backlog, 0) > 50 then 'warning'
        else 'healthy'
      end
    ),
    'webhooks', json_build_object(
      'total_7d', coalesce(v_webhook_total, 0),
      'failed_7d', coalesce(v_webhook_failed, 0),
      'last_success', v_webhook_last_success,
      'retry_queue', coalesce(v_webhook_failed, 0),
      'status', case
        when coalesce(v_webhook_failed, 0) > 5 then 'action_required'
        when coalesce(v_webhook_failed, 0) > 0 then 'warning'
        else 'healthy'
      end
    ),
    'affiliate_platform', json_build_object(
      'pending_commissions', coalesce(v_pending_commissions, 0),
      'pending_payouts', coalesce(v_pending_payouts, 0),
      'open_fraud_flags', coalesce(v_open_fraud_flags, 0),
      'status', case when coalesce(v_open_fraud_flags, 0) > 0 then 'warning' else 'healthy' end
    ),
    'scheduled_jobs', json_build_object(
      'approve_commissions', public.get_scheduled_job_status('approve_commissions'),
      'process_notifications', public.get_scheduled_job_status('process_notifications'),
      'monthly_billing', public.get_scheduled_job_status('monthly_billing'),
      'monthly_payouts', public.get_scheduled_job_status('monthly_payouts')
    )
  );
end;
$$;

grant execute on function public.get_platform_health_dashboard() to authenticated;

grant execute on function public.create_affiliate_fraud_flag(text, uuid, uuid, uuid, text, integer, jsonb) to service_role;

alter table public.affiliate_fraud_flags enable row level security;
alter table public.scheduled_job_runs enable row level security;

drop policy if exists affiliate_fraud_flags_admin on public.affiliate_fraud_flags;
create policy affiliate_fraud_flags_admin on public.affiliate_fraud_flags
  for select using (public.is_admin());

drop policy if exists affiliate_audit_logs_admin on public.affiliate_audit_logs;
create policy affiliate_audit_logs_admin on public.affiliate_audit_logs
  for select using (public.is_admin());

drop policy if exists scheduled_job_runs_admin on public.scheduled_job_runs;
create policy scheduled_job_runs_admin on public.scheduled_job_runs
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- pg_cron: commission approval (SQL-only, runs without HTTP)
-- ---------------------------------------------------------------------------

do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('foodvault-approve-commissions');

    perform cron.schedule(
      'foodvault-approve-commissions',
      '0 2 * * *',
      $job$select public.approve_expired_commissions();$job$
    );
  end if;
exception
  when others then
    raise notice 'pg_cron scheduling skipped: %', sqlerrm;
end;
$cron$;

-- HTTP-dependent jobs (notifications, billing, payouts) must be scheduled via:
--   POST /api/cron/run-frequent  (every 5 minutes) — notifications + commission approval backup
--   POST /api/cron/run-monthly   (1st of month)    — billing + payouts
-- Configure in Vercel Cron, Supabase Edge Functions, or pg_net with CRON_SECRET.

notify pgrst, 'reload schema';
