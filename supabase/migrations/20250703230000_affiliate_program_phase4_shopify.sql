-- Affiliate Program Phase 4: Store Integration, Sales Tracking & Commission Engine

create or replace function public.affiliate_commission_hold_days()
returns integer
language sql
immutable
as $$
  select 30;
$$;

create table if not exists public.store_integrations (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  platform text not null,
  store_name text not null,
  store_url text,
  external_store_id text not null,
  access_token_encrypted text not null,
  status text not null default 'connected',
  connected_at timestamptz not null default now(),
  disconnected_at timestamptz,
  last_sync_at timestamptz,
  webhook_secret text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_integrations_platform_check check (
    platform in ('shopify', 'woocommerce', 'bigcommerce', 'magento', 'custom')
  ),
  constraint store_integrations_status_check check (
    status in ('connected', 'disconnected', 'error', 'paused')
  ),
  constraint store_integrations_partner_platform_store_unique unique (partner_id, platform, external_store_id)
);

create index if not exists store_integrations_partner_idx on public.store_integrations (partner_id);
create index if not exists store_integrations_external_store_idx on public.store_integrations (platform, external_store_id);

create table if not exists public.affiliate_attribution_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token text not null unique,
  referral_link_id uuid not null references public.affiliate_referral_links(id) on delete cascade,
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  click_event_id uuid references public.affiliate_click_events(id) on delete set null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists affiliate_attribution_sessions_token_idx on public.affiliate_attribution_sessions (session_token);
create index if not exists affiliate_attribution_sessions_partner_expires_idx on public.affiliate_attribution_sessions (partner_id, expires_at desc);

create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  integration_id uuid references public.store_integrations(id) on delete set null,
  platform text not null,
  external_order_id text not null,
  order_number text not null,
  order_date timestamptz not null,
  gross_total numeric(12, 2) not null,
  currency text not null default 'NZD',
  external_status text not null default 'open',
  attribution_session_id uuid references public.affiliate_attribution_sessions(id) on delete set null,
  affiliate_id uuid references public.affiliates(id) on delete set null,
  referral_link_id uuid references public.affiliate_referral_links(id) on delete set null,
  attribution_method text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_orders_integration_external_unique unique (integration_id, external_order_id)
);

create index if not exists store_orders_partner_date_idx on public.store_orders (partner_id, order_date desc);
create index if not exists store_orders_affiliate_date_idx on public.store_orders (affiliate_id, order_date desc) where affiliate_id is not null;

create table if not exists public.store_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.store_orders(id) on delete cascade,
  product_title text not null,
  sku text,
  quantity integer not null default 1,
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists store_order_items_order_idx on public.store_order_items (order_id);

create table if not exists public.commission_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.store_orders(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  referral_link_id uuid references public.affiliate_referral_links(id) on delete set null,
  gross_sale numeric(12, 2) not null,
  commission_percent numeric(5, 2) not null,
  commission_value numeric(12, 2) not null,
  currency text not null default 'NZD',
  status text not null default 'pending',
  hold_expires_at timestamptz not null,
  approved_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  refunded_at timestamptz,
  review_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commission_records_status_check check (
    status in ('pending', 'approved', 'paid', 'cancelled', 'refunded')
  )
);

create index if not exists commission_records_partner_status_idx on public.commission_records (partner_id, status, created_at desc);
create index if not exists commission_records_affiliate_status_idx on public.commission_records (affiliate_id, status, created_at desc);
create index if not exists commission_records_hold_expires_idx on public.commission_records (status, hold_expires_at) where status = 'pending';

create table if not exists public.commission_refund_events (
  id uuid primary key default gen_random_uuid(),
  commission_id uuid not null references public.commission_records(id) on delete cascade,
  external_refund_id text,
  refund_amount numeric(12, 2) not null default 0,
  commission_adjustment numeric(12, 2) not null default 0,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.store_webhook_logs (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid references public.store_integrations(id) on delete set null,
  platform text not null,
  topic text not null,
  external_id text,
  status text not null default 'pending',
  attempts integer not null default 0,
  error_message text,
  raw_payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint store_webhook_logs_status_check check (
    status in ('pending', 'processing', 'processed', 'failed', 'ignored')
  )
);

create index if not exists store_webhook_logs_status_idx on public.store_webhook_logs (status, created_at desc);

create or replace function public.refresh_referral_link_sales_stats(p_referral_link_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.affiliate_referral_links rl
  set
    conversion_count = coalesce(stats.order_count, 0),
    estimated_sales = coalesce(stats.total_sales, 0),
    estimated_commission = coalesce(stats.total_commission, 0)
  from (
    select
      count(*)::integer as order_count,
      coalesce(sum(cr.gross_sale), 0) as total_sales,
      coalesce(sum(case when cr.status in ('pending', 'approved', 'paid') then cr.commission_value else 0 end), 0) as total_commission
    from public.commission_records cr
    where cr.referral_link_id = p_referral_link_id
      and cr.status not in ('cancelled')
  ) stats
  where rl.id = p_referral_link_id;
end;
$$;

create or replace function public.resolve_attribution_session(p_session_token text)
returns public.affiliate_attribution_sessions
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_session public.affiliate_attribution_sessions;
begin
  select * into v_session
  from public.affiliate_attribution_sessions s
  where s.session_token = trim(p_session_token)
    and s.expires_at > now()
  limit 1;
  return v_session;
end;
$$;

-- Phase 2 returned text (website_url); Phase 4 returns json (redirect + session).
drop function if exists public.record_affiliate_click(text, text, text, text, text);

create or replace function public.record_affiliate_click(
  p_brand_slug text,
  p_affiliate_code text,
  p_device text default null,
  p_referrer text default null,
  p_user_agent text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.affiliate_referral_links%rowtype;
  v_partner public.partners%rowtype;
  v_click_id uuid;
  v_session_token text;
  v_cookie_days integer;
  v_redirect_url text;
begin
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

  insert into public.affiliate_click_events (
    affiliate_id, partner_id, referral_link_id, device, referrer, user_agent
  ) values (
    v_link.affiliate_id, v_link.partner_id, v_link.id, p_device, p_referrer, p_user_agent
  )
  returning id into v_click_id;

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

  return json_build_object(
    'website_url', v_partner.website_url,
    'redirect_url', v_redirect_url,
    'session_token', v_session_token,
    'cookie_duration_days', v_cookie_days
  );
end;
$$;

grant execute on function public.record_affiliate_click(text, text, text, text, text) to anon, authenticated;

create or replace function public.ingest_store_order(
  p_integration_id uuid,
  p_platform text,
  p_external_order_id text,
  p_order_number text,
  p_order_date timestamptz,
  p_gross_total numeric,
  p_currency text,
  p_external_status text,
  p_session_token text default null,
  p_attribution_method text default null,
  p_line_items jsonb default '[]'::jsonb,
  p_raw_payload jsonb default '{}'::jsonb
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_integration public.store_integrations%rowtype;
  v_session public.affiliate_attribution_sessions;
  v_order_id uuid;
  v_commission_id uuid;
  v_commission_percent numeric(5, 2);
  v_commission_value numeric(12, 2);
  v_hold_days integer;
  v_item jsonb;
  v_existing uuid;
begin
  select * into v_integration from public.store_integrations
  where id = p_integration_id and status = 'connected';

  if v_integration.id is null then
    return json_build_object('success', false, 'error', 'integration_not_connected');
  end if;

  select id into v_existing from public.store_orders
  where integration_id = p_integration_id and external_order_id = p_external_order_id;

  if v_existing is not null then
    return json_build_object('success', true, 'order_id', v_existing, 'duplicate', true);
  end if;

  if p_session_token is not null and trim(p_session_token) <> '' then
    select * into v_session from public.resolve_attribution_session(p_session_token);
  end if;

  insert into public.store_orders (
    partner_id, integration_id, platform, external_order_id, order_number, order_date,
    gross_total, currency, external_status, attribution_session_id, affiliate_id,
    referral_link_id, attribution_method, raw_payload
  ) values (
    v_integration.partner_id, v_integration.id, p_platform, p_external_order_id, p_order_number,
    p_order_date, p_gross_total, upper(coalesce(nullif(trim(p_currency), ''), 'NZD')),
    coalesce(nullif(trim(p_external_status), ''), 'open'), v_session.id, v_session.affiliate_id,
    v_session.referral_link_id, p_attribution_method, p_raw_payload
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_line_items, '[]'::jsonb)) loop
    insert into public.store_order_items (order_id, product_title, sku, quantity, unit_price, line_total)
    values (
      v_order_id,
      coalesce(v_item->>'product_title', 'Item'),
      nullif(v_item->>'sku', ''),
      coalesce((v_item->>'quantity')::integer, 1),
      coalesce((v_item->>'unit_price')::numeric, 0),
      coalesce((v_item->>'line_total')::numeric, 0)
    );
  end loop;

  update public.store_integrations set last_sync_at = now(), updated_at = now() where id = p_integration_id;

  if v_session.affiliate_id is not null then
    select coalesce(p.affiliate_commission_percent, 0) into v_commission_percent
    from public.partners p where p.id = v_integration.partner_id;

    v_commission_value := round(p_gross_total * v_commission_percent / 100.0, 2);
    v_hold_days := public.affiliate_commission_hold_days();

    insert into public.commission_records (
      order_id, partner_id, affiliate_id, referral_link_id, gross_sale, commission_percent,
      commission_value, currency, status, hold_expires_at
    ) values (
      v_order_id, v_integration.partner_id, v_session.affiliate_id, v_session.referral_link_id,
      p_gross_total, v_commission_percent, v_commission_value,
      upper(coalesce(nullif(trim(p_currency), ''), 'NZD')), 'pending',
      p_order_date + make_interval(days => v_hold_days)
    ) returning id into v_commission_id;

    if v_session.referral_link_id is not null then
      perform public.refresh_referral_link_sales_stats(v_session.referral_link_id);
    end if;

    insert into public.affiliate_notification_events (event_type, partner_id, affiliate_id, payload)
    values ('FIRST_SALE', v_integration.partner_id, v_session.affiliate_id,
      jsonb_build_object('order_id', v_order_id, 'commission_id', v_commission_id));
  end if;

  return json_build_object(
    'success', true, 'order_id', v_order_id, 'commission_id', v_commission_id,
    'attributed', v_session.id is not null
  );
end;
$$;

create or replace function public.update_store_order_status(
  p_integration_id uuid,
  p_external_order_id text,
  p_external_status text,
  p_refund_amount numeric default null,
  p_external_refund_id text default null,
  p_raw_payload jsonb default '{}'::jsonb
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.store_orders%rowtype;
  v_commission public.commission_records%rowtype;
  v_new_status text;
begin
  select * into v_order from public.store_orders
  where integration_id = p_integration_id and external_order_id = p_external_order_id;

  if v_order.id is null then
    return json_build_object('success', false, 'error', 'order_not_found');
  end if;

  update public.store_orders set external_status = p_external_status, updated_at = now() where id = v_order.id;
  select * into v_commission from public.commission_records where order_id = v_order.id;

  if v_commission.id is null then
    return json_build_object('success', true, 'commission_updated', false);
  end if;

  if lower(p_external_status) in ('cancelled', 'voided') then
    v_new_status := 'cancelled';
    update public.commission_records
    set status = 'cancelled', cancelled_at = now(), updated_at = now()
    where id = v_commission.id and status in ('pending', 'approved');
  elsif p_refund_amount is not null and p_refund_amount > 0 then
    v_new_status := 'refunded';
    update public.commission_records
    set
      status = 'refunded', refunded_at = now(),
      review_required = case when v_commission.status = 'paid' then true else review_required end,
      commission_value = greatest(0, v_commission.commission_value - round(
        v_commission.commission_value * least(1, p_refund_amount / nullif(v_commission.gross_sale, 0)), 2)),
      updated_at = now()
    where id = v_commission.id;

    insert into public.commission_refund_events (commission_id, external_refund_id, refund_amount, commission_adjustment, raw_payload)
    values (v_commission.id, p_external_refund_id, p_refund_amount,
      coalesce(p_refund_amount * v_commission.commission_percent / 100.0, 0), p_raw_payload);
  end if;

  if v_commission.referral_link_id is not null then
    perform public.refresh_referral_link_sales_stats(v_commission.referral_link_id);
  end if;

  return json_build_object('success', true, 'commission_updated', true, 'status', v_new_status);
end;
$$;

create or replace function public.approve_expired_commissions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  update public.commission_records
  set status = 'approved', approved_at = now(), updated_at = now()
  where status = 'pending' and hold_expires_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.get_partner_store_integration(p_partner_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_row public.store_integrations%rowtype;
begin
  if not exists (select 1 from public.partners p where p.id = p_partner_id and p.user_id = auth.uid()) then
    raise exception 'Unauthorized';
  end if;

  select * into v_row from public.store_integrations si
  where si.partner_id = p_partner_id and si.platform = 'shopify'
  order by si.connected_at desc limit 1;

  if v_row.id is null then
    return json_build_object('connected', false);
  end if;

  return json_build_object(
    'connected', v_row.status = 'connected', 'platform', v_row.platform,
    'store_name', v_row.store_name, 'store_url', v_row.store_url,
    'external_store_id', v_row.external_store_id, 'status', v_row.status,
    'connected_at', v_row.connected_at, 'disconnected_at', v_row.disconnected_at,
    'last_sync_at', v_row.last_sync_at
  );
end;
$$;

grant execute on function public.get_partner_store_integration(uuid) to authenticated;

create or replace function public.get_partner_affiliate_sales_overview(p_partner_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_partner public.partners%rowtype;
  v_clicks bigint;
  v_orders bigint;
  v_revenue numeric;
  v_commission_owed numeric;
begin
  if not exists (select 1 from public.partners p where p.id = p_partner_id and p.user_id = auth.uid()) then
    raise exception 'Unauthorized';
  end if;

  select * into v_partner from public.partners where id = p_partner_id;
  if not coalesce(v_partner.affiliate_enabled, false) then
    return json_build_object('enabled', false);
  end if;

  select count(*) into v_clicks from public.affiliate_click_events where partner_id = p_partner_id;

  select
    count(*) filter (where cr.status not in ('cancelled')),
    coalesce(sum(cr.gross_sale) filter (where cr.status not in ('cancelled', 'refunded')), 0),
    coalesce(sum(cr.commission_value) filter (where cr.status = 'approved'), 0)
  into v_orders, v_revenue, v_commission_owed
  from public.commission_records cr where cr.partner_id = p_partner_id;

  return json_build_object(
    'enabled', true,
    'affiliate_revenue', v_revenue,
    'affiliate_orders', v_orders,
    'commission_owed', v_commission_owed,
    'conversion_rate', case when v_clicks > 0 then round((v_orders::numeric / v_clicks) * 100, 1) else 0 end,
    'average_order_value', case when v_orders > 0 then round(v_revenue / v_orders, 2) else 0 end
  );
end;
$$;

grant execute on function public.get_partner_affiliate_sales_overview(uuid) to authenticated;

create or replace function public.get_partner_affiliate_orders(
  p_partner_id uuid, p_search text default null, p_status text default null, p_sort text default 'newest'
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.partners p where p.id = p_partner_id and p.user_id = auth.uid()) then
    raise exception 'Unauthorized';
  end if;

  return coalesce((
    select json_agg(row_to_json(t)) from (
      select o.id as order_id, o.order_number, o.order_date, o.gross_total, o.currency,
        cr.id as commission_id, cr.commission_percent, cr.commission_value, cr.status as commission_status,
        a.id as affiliate_id, a.first_name, a.last_name
      from public.store_orders o
      left join public.commission_records cr on cr.order_id = o.id
      left join public.affiliates a on a.id = o.affiliate_id
      where o.partner_id = p_partner_id and o.affiliate_id is not null
        and (p_search is null or trim(p_search) = '' or o.order_number ilike '%' || trim(p_search) || '%'
          or a.first_name ilike '%' || trim(p_search) || '%' or a.last_name ilike '%' || trim(p_search) || '%')
        and (p_status is null or trim(p_status) = '' or cr.status = lower(trim(p_status)))
      order by case when coalesce(p_sort, 'newest') = 'oldest' then o.order_date end asc,
        case when coalesce(p_sort, 'newest') <> 'oldest' then o.order_date end desc
    ) t
  ), '[]'::json);
end;
$$;

grant execute on function public.get_partner_affiliate_orders(uuid, text, text, text) to authenticated;

create or replace function public.get_affiliate_earnings_stats(p_affiliate_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.affiliates a where a.id = p_affiliate_id and a.user_id = auth.uid()) then
    raise exception 'Unauthorized';
  end if;

  return json_build_object(
    'total_sales', coalesce((select sum(cr.gross_sale) from public.commission_records cr
      where cr.affiliate_id = p_affiliate_id and cr.status not in ('cancelled')), 0),
    'total_orders', coalesce((select count(*) from public.commission_records cr
      where cr.affiliate_id = p_affiliate_id and cr.status not in ('cancelled')), 0),
    'pending_earnings', coalesce((select sum(cr.commission_value) from public.commission_records cr
      where cr.affiliate_id = p_affiliate_id and cr.status = 'pending'), 0),
    'approved_earnings', coalesce((select sum(cr.commission_value) from public.commission_records cr
      where cr.affiliate_id = p_affiliate_id and cr.status = 'approved'), 0),
    'paid_earnings', coalesce((select sum(cr.commission_value) from public.commission_records cr
      where cr.affiliate_id = p_affiliate_id and cr.status = 'paid'), 0)
  );
end;
$$;

grant execute on function public.get_affiliate_earnings_stats(uuid) to authenticated;

create or replace function public.get_affiliate_recent_orders(p_affiliate_id uuid, p_limit integer default 20)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.affiliates a where a.id = p_affiliate_id and a.user_id = auth.uid()) then
    raise exception 'Unauthorized';
  end if;

  return coalesce((
    select json_agg(row_to_json(t)) from (
      select cr.id as commission_id, o.order_number, o.order_date, o.gross_total,
        cr.commission_percent, cr.commission_value, cr.currency, cr.status,
        p.business_name, p.slug
      from public.commission_records cr
      join public.store_orders o on o.id = cr.order_id
      join public.partners p on p.id = cr.partner_id
      where cr.affiliate_id = p_affiliate_id
      order by o.order_date desc
      limit greatest(1, least(p_limit, 100))
    ) t
  ), '[]'::json);
end;
$$;

grant execute on function public.get_affiliate_recent_orders(uuid, integer) to authenticated;

create or replace function public.admin_affiliate_transactions(p_search text default null, p_status text default null)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admin_users au where au.auth_user_id = auth.uid()) then
    raise exception 'Unauthorized';
  end if;

  return json_build_object(
    'summary', json_build_object(
      'platform_sales', coalesce((select sum(cr.gross_sale) from public.commission_records cr where cr.status not in ('cancelled')), 0),
      'pending_commission', coalesce((select sum(cr.commission_value) from public.commission_records cr where cr.status = 'pending'), 0),
      'approved_commission', coalesce((select sum(cr.commission_value) from public.commission_records cr where cr.status = 'approved'), 0),
      'paid_commission', coalesce((select sum(cr.commission_value) from public.commission_records cr where cr.status = 'paid'), 0),
      'refunded_commission', coalesce((select sum(cr.commission_value) from public.commission_records cr where cr.status = 'refunded'), 0),
      'cancelled_commission', coalesce((select sum(cr.commission_value) from public.commission_records cr where cr.status = 'cancelled'), 0)
    ),
    'transactions', coalesce((
      select json_agg(row_to_json(t)) from (
        select cr.id, o.order_number, o.order_date, cr.gross_sale, cr.commission_value, cr.currency,
          cr.status, cr.review_required, p.business_name, p.slug, a.first_name, a.last_name, a.email, si.platform
        from public.commission_records cr
        join public.store_orders o on o.id = cr.order_id
        join public.partners p on p.id = cr.partner_id
        join public.affiliates a on a.id = cr.affiliate_id
        left join public.store_integrations si on si.id = o.integration_id
        where (p_search is null or trim(p_search) = '' or o.order_number ilike '%' || trim(p_search) || '%'
          or p.business_name ilike '%' || trim(p_search) || '%' or a.email ilike '%' || trim(p_search) || '%'
          or a.first_name ilike '%' || trim(p_search) || '%' or a.last_name ilike '%' || trim(p_search) || '%')
          and (p_status is null or trim(p_status) = '' or cr.status = lower(trim(p_status)))
        order by o.order_date desc limit 500
      ) t
    ), '[]'::json)
  );
end;
$$;

grant execute on function public.admin_affiliate_transactions(text, text) to authenticated;

create or replace function public.get_partner_affiliate_overview(p_partner_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_partner public.partners%rowtype;
  v_sales json;
begin
  if not exists (select 1 from public.partners p where p.id = p_partner_id and p.user_id = auth.uid()) then
    raise exception 'Unauthorized';
  end if;

  select * into v_partner from public.partners where id = p_partner_id;
  if not coalesce(v_partner.affiliate_enabled, false) then
    return json_build_object('enabled', false);
  end if;

  select public.get_partner_affiliate_sales_overview(p_partner_id) into v_sales;

  return json_build_object(
    'enabled', true,
    'total_affiliates', (select count(distinct arl.affiliate_id) from public.affiliate_referral_links arl where arl.partner_id = p_partner_id),
    'referral_links', (select count(*) from public.affiliate_referral_links where partner_id = p_partner_id),
    'total_clicks', (select count(*) from public.affiliate_click_events where partner_id = p_partner_id),
    'clicks_this_month', (select count(*) from public.affiliate_click_events where partner_id = p_partner_id and clicked_at >= date_trunc('month', now())),
    'clicks_this_week', (select count(*) from public.affiliate_click_events where partner_id = p_partner_id and clicked_at >= date_trunc('week', now())),
    'clicks_today', (select count(*) from public.affiliate_click_events where partner_id = p_partner_id and clicked_at >= date_trunc('day', now())),
    'estimated_sales', (v_sales->>'affiliate_revenue')::numeric,
    'estimated_commission', (v_sales->>'commission_owed')::numeric,
    'affiliate_orders', (v_sales->>'affiliate_orders')::bigint,
    'conversion_rate', (v_sales->>'conversion_rate')::numeric,
    'average_order_value', (v_sales->>'average_order_value')::numeric
  );
end;
$$;

alter table public.store_integrations enable row level security;
alter table public.store_orders enable row level security;
alter table public.commission_records enable row level security;
alter table public.affiliate_attribution_sessions enable row level security;
alter table public.store_webhook_logs enable row level security;

grant execute on function public.ingest_store_order(
  uuid, text, text, text, timestamptz, numeric, text, text, text, text, jsonb, jsonb
) to service_role;

grant execute on function public.update_store_order_status(
  uuid, text, text, numeric, text, jsonb
) to service_role;

grant execute on function public.approve_expired_commissions() to service_role;

grant execute on function public.resolve_attribution_session(text) to service_role;
