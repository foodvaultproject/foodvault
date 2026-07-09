-- Partner Affiliate Dashboard & Analytics (Phase 3)

alter table public.affiliate_referral_links
  add column if not exists click_count bigint not null default 0,
  add column if not exists conversion_count integer not null default 0,
  add column if not exists estimated_sales numeric(12, 2),
  add column if not exists estimated_commission numeric(12, 2),
  add column if not exists last_clicked_at timestamptz;

comment on column public.affiliate_referral_links.click_count is
  'Cached click total for dashboard performance. Updated on each click event.';
comment on column public.affiliate_referral_links.estimated_sales is
  'Populated by ecommerce integration (Shopify, WooCommerce, etc.).';
comment on column public.affiliate_referral_links.estimated_commission is
  'Populated by ecommerce integration when sales are tracked.';

create table if not exists public.affiliate_notification_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  partner_id uuid references public.partners(id) on delete cascade,
  affiliate_id uuid references public.affiliates(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  constraint affiliate_notification_events_type_check check (
    event_type in (
      'NEW_AFFILIATE_REGISTERED',
      'CLICK_MILESTONE',
      'FIRST_SALE',
      'MONTHLY_SUMMARY',
      'AFFILIATE_PAYMENT_SENT'
    )
  )
);

comment on table public.affiliate_notification_events is
  'Notification queue for future affiliate/partner alerts. Not sent in Phase 3.';

create index if not exists affiliate_notification_events_partner_idx
  on public.affiliate_notification_events (partner_id, created_at desc);
create index if not exists affiliate_notification_events_unsent_idx
  on public.affiliate_notification_events (sent_at)
  where sent_at is null;

-- Keep referral link click_count in sync with click events.
create or replace function public.trg_affiliate_click_update_link_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.referral_link_id is not null then
    update public.affiliate_referral_links
    set
      click_count = click_count + 1,
      last_clicked_at = new.clicked_at
    where id = new.referral_link_id;
  else
    update public.affiliate_referral_links
    set
      click_count = click_count + 1,
      last_clicked_at = new.clicked_at
    where affiliate_id = new.affiliate_id
      and partner_id = new.partner_id;
  end if;

  return new;
end;
$$;

drop trigger if exists affiliate_click_update_link_stats on public.affiliate_click_events;
create trigger affiliate_click_update_link_stats
  after insert on public.affiliate_click_events
  for each row
  execute function public.trg_affiliate_click_update_link_stats();

-- Queue notification events (structure only — no delivery in Phase 3).
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
begin
  insert into public.affiliate_notification_events (
    event_type,
    partner_id,
    affiliate_id,
    payload
  ) values (
    p_event_type,
    p_partner_id,
    p_affiliate_id,
    coalesce(p_payload, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.trg_affiliate_link_notify_new()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.queue_affiliate_notification(
    'NEW_AFFILIATE_REGISTERED',
    new.partner_id,
    new.affiliate_id,
    jsonb_build_object('referral_link_id', new.id, 'link_path', new.link_path)
  );
  return new;
end;
$$;

drop trigger if exists affiliate_link_notify_new on public.affiliate_referral_links;
create trigger affiliate_link_notify_new
  after insert on public.affiliate_referral_links
  for each row
  execute function public.trg_affiliate_link_notify_new();

-- Backfill click_count from existing events.
update public.affiliate_referral_links l
set
  click_count = stats.total,
  last_clicked_at = stats.last_click
from (
  select
    coalesce(referral_link_id, rl.id) as link_id,
    count(*) as total,
    max(clicked_at) as last_click
  from public.affiliate_click_events e
  left join public.affiliate_referral_links rl
    on rl.affiliate_id = e.affiliate_id
   and rl.partner_id = e.partner_id
  group by coalesce(e.referral_link_id, rl.id)
) stats
where l.id = stats.link_id;

create or replace function public.get_partner_affiliate_program(p_partner_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row record;
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  select
    p.id,
    p.slug,
    p.business_name,
    p.affiliate_enabled,
    p.affiliate_commission_percent,
    p.affiliate_cookie_duration_days
  into v_row
  from public.partners p
  where p.id = p_partner_id
    and p.user_id = v_uid;

  if v_row.id is null then
    raise exception 'Partner not found';
  end if;

  return json_build_object(
    'id', v_row.id,
    'slug', v_row.slug,
    'business_name', v_row.business_name,
    'affiliate_enabled', coalesce(v_row.affiliate_enabled, false),
    'affiliate_commission_percent', v_row.affiliate_commission_percent,
    'affiliate_cookie_duration_days', v_row.affiliate_cookie_duration_days
  );
end;
$$;

grant execute on function public.get_partner_affiliate_program(uuid) to authenticated;

create or replace function public.get_partner_affiliate_overview(p_partner_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_enabled boolean;
  v_month_start timestamptz := date_trunc('month', now());
  v_week_start timestamptz := now() - interval '7 days';
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  select p.affiliate_enabled into v_enabled
  from public.partners p
  where p.id = p_partner_id and p.user_id = v_uid;

  if v_enabled is null then
    raise exception 'Partner not found';
  end if;

  if not coalesce(v_enabled, false) then
    return json_build_object('enabled', false);
  end if;

  return json_build_object(
    'enabled', true,
    'total_affiliates', (
      select count(distinct l.affiliate_id)
      from public.affiliate_referral_links l
      where l.partner_id = p_partner_id
    ),
    'referral_links', (
      select count(*) from public.affiliate_referral_links l where l.partner_id = p_partner_id
    ),
    'total_clicks', (
      select count(*) from public.affiliate_click_events e where e.partner_id = p_partner_id
    ),
    'clicks_this_month', (
      select count(*) from public.affiliate_click_events e
      where e.partner_id = p_partner_id and e.clicked_at >= v_month_start
    ),
    'clicks_this_week', (
      select count(*) from public.affiliate_click_events e
      where e.partner_id = p_partner_id and e.clicked_at >= v_week_start
    ),
    'clicks_today', (
      select count(*) from public.affiliate_click_events e
      where e.partner_id = p_partner_id and e.clicked_at >= date_trunc('day', now())
    ),
    'estimated_sales', null,
    'estimated_commission', null
  );
end;
$$;

grant execute on function public.get_partner_affiliate_overview(uuid) to authenticated;

create or replace function public.get_partner_affiliate_directory(
  p_partner_id uuid,
  p_search text default null,
  p_sort text default 'newest',
  p_country text default null
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from public.partners p
    where p.id = p_partner_id and p.user_id = v_uid and p.affiliate_enabled = true
  ) then
    raise exception 'Unauthorized';
  end if;

  return coalesce((
    select json_agg(row_to_json(t))
    from (
      select
        a.id as affiliate_id,
        a.first_name,
        a.last_name,
        a.country,
        a.status,
        a.created_at as joined_at,
        l.id as link_id,
        l.link_path,
        l.created_at as link_created_at,
        coalesce(l.click_count, 0) as total_clicks,
        l.estimated_sales,
        l.estimated_commission
      from public.affiliate_referral_links l
      join public.affiliates a on a.id = l.affiliate_id
      where l.partner_id = p_partner_id
        and (
          p_search is null
          or trim(p_search) = ''
          or a.first_name ilike '%' || trim(p_search) || '%'
          or a.last_name ilike '%' || trim(p_search) || '%'
          or (a.first_name || ' ' || a.last_name) ilike '%' || trim(p_search) || '%'
        )
        and (p_country is null or trim(p_country) = '' or a.country = p_country)
      order by
        case when p_sort = 'clicks' then coalesce(l.click_count, 0) end desc,
        case when p_sort = 'alpha' then a.last_name end asc,
        case when p_sort = 'alpha' then a.first_name end asc,
        case when p_sort = 'newest' then a.created_at end desc,
        a.created_at desc
    ) t
  ), '[]'::json);
end;
$$;

grant execute on function public.get_partner_affiliate_directory(uuid, text, text, text) to authenticated;

create or replace function public.get_partner_affiliate_detail(
  p_partner_id uuid,
  p_affiliate_id uuid
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from public.partners p
    where p.id = p_partner_id and p.user_id = v_uid and p.affiliate_enabled = true
  ) then
    raise exception 'Unauthorized';
  end if;

  return (
    select json_build_object(
      'affiliate_id', a.id,
      'first_name', a.first_name,
      'last_name', a.last_name,
      'country', a.country,
      'status', a.status,
      'joined_at', a.created_at,
      'link_path', l.link_path,
      'link_created_at', l.created_at,
      'total_clicks', coalesce(l.click_count, 0),
      'estimated_sales', l.estimated_sales,
      'estimated_commission', l.estimated_commission,
      'recent_activity', coalesce((
        select json_agg(row_to_json(r))
        from (
          select e.clicked_at, e.device, e.referrer
          from public.affiliate_click_events e
          where e.partner_id = p_partner_id
            and e.affiliate_id = p_affiliate_id
          order by e.clicked_at desc
          limit 10
        ) r
      ), '[]'::json)
    )
    from public.affiliate_referral_links l
    join public.affiliates a on a.id = l.affiliate_id
    where l.partner_id = p_partner_id
      and l.affiliate_id = p_affiliate_id
  );
end;
$$;

grant execute on function public.get_partner_affiliate_detail(uuid, uuid) to authenticated;

create or replace function public.get_partner_affiliate_analytics(p_partner_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from public.partners p
    where p.id = p_partner_id and p.user_id = v_uid and p.affiliate_enabled = true
  ) then
    raise exception 'Unauthorized';
  end if;

  return json_build_object(
    'clicks_today', (
      select count(*) from public.affiliate_click_events e
      where e.partner_id = p_partner_id and e.clicked_at >= date_trunc('day', now())
    ),
    'clicks_7_days', (
      select count(*) from public.affiliate_click_events e
      where e.partner_id = p_partner_id and e.clicked_at >= now() - interval '7 days'
    ),
    'clicks_30_days', (
      select count(*) from public.affiliate_click_events e
      where e.partner_id = p_partner_id and e.clicked_at >= now() - interval '30 days'
    ),
    'clicks_all_time', (
      select count(*) from public.affiliate_click_events e where e.partner_id = p_partner_id
    ),
    'daily_clicks', coalesce((
      select json_agg(row_to_json(d))
      from (
        select
          to_char(date_trunc('day', e.clicked_at), 'YYYY-MM-DD') as day,
          count(*)::bigint as clicks
        from public.affiliate_click_events e
        where e.partner_id = p_partner_id
          and e.clicked_at >= now() - interval '30 days'
        group by date_trunc('day', e.clicked_at)
        order by date_trunc('day', e.clicked_at)
      ) d
    ), '[]'::json),
    'monthly_clicks', coalesce((
      select json_agg(row_to_json(m))
      from (
        select
          to_char(date_trunc('month', e.clicked_at), 'YYYY-MM') as month,
          count(*)::bigint as clicks
        from public.affiliate_click_events e
        where e.partner_id = p_partner_id
          and e.clicked_at >= now() - interval '12 months'
        group by date_trunc('month', e.clicked_at)
        order by date_trunc('month', e.clicked_at)
      ) m
    ), '[]'::json),
    'top_referrers', coalesce((
      select json_agg(row_to_json(r))
      from (
        select
          coalesce(nullif(trim(e.referrer), ''), 'Direct') as source,
          count(*)::bigint as clicks
        from public.affiliate_click_events e
        where e.partner_id = p_partner_id
        group by coalesce(nullif(trim(e.referrer), ''), 'Direct')
        order by count(*) desc
        limit 8
      ) r
    ), '[]'::json),
    'top_devices', coalesce((
      select json_agg(row_to_json(d))
      from (
        select
          coalesce(nullif(trim(e.device), ''), 'Unknown') as device,
          count(*)::bigint as clicks
        from public.affiliate_click_events e
        where e.partner_id = p_partner_id
        group by coalesce(nullif(trim(e.device), ''), 'Unknown')
        order by count(*) desc
      ) d
    ), '[]'::json)
  );
end;
$$;

grant execute on function public.get_partner_affiliate_analytics(uuid) to authenticated;

create or replace function public.get_partner_referral_links(
  p_partner_id uuid,
  p_search text default null
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from public.partners p
    where p.id = p_partner_id and p.user_id = v_uid and p.affiliate_enabled = true
  ) then
    raise exception 'Unauthorized';
  end if;

  return coalesce((
    select json_agg(row_to_json(t))
    from (
      select
        l.id as link_id,
        l.link_path,
        l.created_at,
        coalesce(l.click_count, 0) as clicks,
        a.id as affiliate_id,
        a.first_name,
        a.last_name
      from public.affiliate_referral_links l
      join public.affiliates a on a.id = l.affiliate_id
      where l.partner_id = p_partner_id
        and (
          p_search is null
          or trim(p_search) = ''
          or l.link_path ilike '%' || trim(p_search) || '%'
          or a.first_name ilike '%' || trim(p_search) || '%'
          or a.last_name ilike '%' || trim(p_search) || '%'
        )
      order by l.created_at desc
    ) t
  ), '[]'::json);
end;
$$;

grant execute on function public.get_partner_referral_links(uuid, text) to authenticated;

create or replace function public.admin_affiliate_analytics()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.admin_users au where au.auth_user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  return json_build_object(
    'participating_brands', (
      select count(*) from public.partners where affiliate_enabled = true
    ),
    'total_affiliates', (select count(*) from public.affiliates),
    'referral_links', (select count(*) from public.affiliate_referral_links),
    'total_clicks', (select count(*) from public.affiliate_click_events),
    'top_brands', coalesce((
      select json_agg(row_to_json(b))
      from (
        select
          p.id,
          p.business_name,
          p.slug,
          count(e.id)::bigint as clicks
        from public.partners p
        join public.affiliate_click_events e on e.partner_id = p.id
        where p.affiliate_enabled = true
        group by p.id, p.business_name, p.slug
        order by count(e.id) desc
        limit 10
      ) b
    ), '[]'::json),
    'top_affiliates', coalesce((
      select json_agg(row_to_json(a))
      from (
        select
          af.id,
          af.first_name,
          af.last_name,
          af.country,
          count(e.id)::bigint as clicks
        from public.affiliates af
        join public.affiliate_click_events e on e.affiliate_id = af.id
        group by af.id, af.first_name, af.last_name, af.country
        order by count(e.id) desc
        limit 10
      ) a
    ), '[]'::json),
    'newest_affiliates', coalesce((
      select json_agg(row_to_json(n))
      from (
        select id, first_name, last_name, email, country, created_at
        from public.affiliates
        order by created_at desc
        limit 10
      ) n
    ), '[]'::json),
    'newest_programs', coalesce((
      select json_agg(row_to_json(p))
      from (
        select
          id,
          business_name,
          slug,
          affiliate_commission_percent,
          affiliate_created_at
        from public.partners
        where affiliate_enabled = true
        order by affiliate_created_at desc nulls last
        limit 10
      ) p
    ), '[]'::json)
  );
end;
$$;

grant execute on function public.admin_affiliate_analytics() to authenticated;

grant select on public.affiliate_notification_events to authenticated;

drop policy if exists affiliate_notifications_partner on public.affiliate_notification_events;
create policy affiliate_notifications_partner on public.affiliate_notification_events
  for select to authenticated
  using (
    partner_id in (select p.id from public.partners p where p.user_id = auth.uid())
  );

notify pgrst, 'reload schema';
