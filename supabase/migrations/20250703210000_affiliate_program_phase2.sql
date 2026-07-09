-- Affiliate Program Phase 2: affiliate accounts, referral links, click tracking.

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  country text not null default 'New Zealand',
  payment_country text not null default 'New Zealand',
  bank_account_name text not null,
  bank_account_number text not null,
  tax_number text,
  referral_code text not null unique,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint affiliates_status_check check (status in ('ACTIVE', 'SUSPENDED'))
);

comment on table public.affiliates is
  'FoodVault affiliate accounts. Approval is automatic on registration.';
comment on column public.affiliates.referral_code is
  'Short public code used in referral URLs (/go/{brand-slug}/{referral_code}).';

create index if not exists affiliates_user_id_idx on public.affiliates (user_id);
create index if not exists affiliates_email_idx on public.affiliates (lower(email));

create table if not exists public.affiliate_referral_links (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  link_path text not null unique,
  created_at timestamptz not null default now(),
  constraint affiliate_referral_links_unique unique (affiliate_id, partner_id)
);

comment on table public.affiliate_referral_links is
  'One referral link per affiliate and participating brand. Generated automatically.';

create index if not exists affiliate_referral_links_affiliate_idx
  on public.affiliate_referral_links (affiliate_id);
create index if not exists affiliate_referral_links_partner_idx
  on public.affiliate_referral_links (partner_id);

create table if not exists public.affiliate_click_events (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  referral_link_id uuid references public.affiliate_referral_links(id) on delete set null,
  clicked_at timestamptz not null default now(),
  device text,
  referrer text,
  user_agent text
);

comment on table public.affiliate_click_events is
  'Referral link click events. Sales and commissions will reference this table in later phases.';

create index if not exists affiliate_click_events_affiliate_idx
  on public.affiliate_click_events (affiliate_id, clicked_at desc);
create index if not exists affiliate_click_events_partner_idx
  on public.affiliate_click_events (partner_id, clicked_at desc);

create or replace function public.generate_affiliate_referral_code()
returns text
language plpgsql
as $$
declare
  v_code text;
begin
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1 from public.affiliates a where a.referral_code = v_code
    );
  end loop;
  return v_code;
end;
$$;

create or replace function public.sync_affiliate_referral_links_for_affiliate(p_affiliate_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  select referral_code into v_code
  from public.affiliates
  where id = p_affiliate_id;

  if v_code is null then
    return;
  end if;

  insert into public.affiliate_referral_links (affiliate_id, partner_id, link_path)
  select
    p_affiliate_id,
    p.id,
    p.slug || '/' || v_code
  from public.partners p
  where p.affiliate_enabled = true
    and coalesce(p.slug, '') <> ''
  on conflict (affiliate_id, partner_id) do nothing;
end;
$$;

create or replace function public.sync_affiliate_referral_links_for_partner(p_partner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
begin
  select slug into v_slug
  from public.partners
  where id = p_partner_id
    and affiliate_enabled = true;

  if v_slug is null or v_slug = '' then
    return;
  end if;

  insert into public.affiliate_referral_links (affiliate_id, partner_id, link_path)
  select
    a.id,
    p_partner_id,
    v_slug || '/' || a.referral_code
  from public.affiliates a
  where a.status = 'ACTIVE'
  on conflict (affiliate_id, partner_id) do nothing;
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
  return new;
end;
$$;

drop trigger if exists partners_sync_affiliate_links on public.partners;
create trigger partners_sync_affiliate_links
  after insert or update of affiliate_enabled, slug on public.partners
  for each row
  execute function public.trg_partners_sync_affiliate_links();

create or replace function public.register_affiliate(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_country text,
  p_payment_country text,
  p_bank_account_name text,
  p_bank_account_number text,
  p_tax_number text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.affiliates%rowtype;
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  insert into public.affiliates (
    user_id,
    first_name,
    last_name,
    email,
    country,
    payment_country,
    bank_account_name,
    bank_account_number,
    tax_number,
    referral_code,
    status
  ) values (
    v_uid,
    trim(p_first_name),
    trim(p_last_name),
    lower(trim(p_email)),
    coalesce(nullif(trim(p_country), ''), 'New Zealand'),
    coalesce(nullif(trim(p_payment_country), ''), 'New Zealand'),
    trim(p_bank_account_name),
    trim(p_bank_account_number),
    nullif(trim(p_tax_number), ''),
    public.generate_affiliate_referral_code(),
    'ACTIVE'
  )
  on conflict (user_id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    country = excluded.country,
    payment_country = excluded.payment_country,
    bank_account_name = excluded.bank_account_name,
    bank_account_number = excluded.bank_account_number,
    tax_number = excluded.tax_number,
    updated_at = now()
  returning * into v_row;

  perform public.sync_affiliate_referral_links_for_affiliate(v_row.id);

  return to_jsonb(v_row)::json;
end;
$$;

grant execute on function public.register_affiliate(
  text, text, text, text, text, text, text, text
) to authenticated;

create or replace function public.record_affiliate_click(
  p_brand_slug text,
  p_affiliate_code text,
  p_device text default null,
  p_referrer text default null,
  p_user_agent text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.affiliate_referral_links%rowtype;
  v_website_url text;
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

  select website_url into v_website_url
  from public.partners
  where id = v_link.partner_id;

  insert into public.affiliate_click_events (
    affiliate_id,
    partner_id,
    referral_link_id,
    device,
    referrer,
    user_agent
  ) values (
    v_link.affiliate_id,
    v_link.partner_id,
    v_link.id,
    p_device,
    p_referrer,
    p_user_agent
  );

  return v_website_url;
end;
$$;

grant execute on function public.record_affiliate_click(
  text, text, text, text, text
) to anon, authenticated;

drop view if exists public.v_affiliate_participating_brands;

create view public.v_affiliate_participating_brands
with (security_invoker = false) as
select
  p.id,
  p.slug,
  p.business_name,
  p.short_description,
  p.logo_url,
  p.logo_original_url,
  p.logo_crop,
  p.affiliate_commission_percent,
  p.affiliate_cookie_duration_days,
  p.affiliate_program_description,
  p.affiliate_terms,
  p.website_url
from public.partners p
where p.affiliate_enabled = true
  and coalesce(p.slug, '') <> '';

grant select on public.v_affiliate_participating_brands to anon, authenticated;

create or replace function public.admin_affiliate_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  if not exists (
    select 1 from public.admin_users au where au.auth_user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  select json_build_object(
    'total_affiliates', (select count(*) from public.affiliates),
    'participating_brands', (select count(*) from public.partners where affiliate_enabled = true),
    'referral_links_generated', (select count(*) from public.affiliate_referral_links),
    'total_clicks', (select count(*) from public.affiliate_click_events)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.admin_affiliate_stats() to authenticated;

create or replace function public.admin_list_affiliates(p_search text default null)
returns setof public.affiliates
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

  return query
  select a.*
  from public.affiliates a
  where p_search is null
    or trim(p_search) = ''
    or a.email ilike '%' || trim(p_search) || '%'
    or a.first_name ilike '%' || trim(p_search) || '%'
    or a.last_name ilike '%' || trim(p_search) || '%'
    or a.referral_code ilike '%' || trim(p_search) || '%'
  order by a.created_at desc;
end;
$$;

grant execute on function public.admin_list_affiliates(text) to authenticated;

create or replace function public.admin_search_affiliate_brands(p_search text default null)
returns table (
  id uuid,
  business_name text,
  slug text,
  affiliate_commission_percent smallint,
  affiliate_enabled boolean
)
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

  return query
  select
    p.id,
    p.business_name,
    p.slug,
    p.affiliate_commission_percent,
    p.affiliate_enabled
  from public.partners p
  where p.affiliate_enabled = true
    and (
      p_search is null
      or trim(p_search) = ''
      or p.business_name ilike '%' || trim(p_search) || '%'
      or p.slug ilike '%' || trim(p_search) || '%'
    )
  order by p.business_name asc;
end;
$$;

grant execute on function public.admin_search_affiliate_brands(text) to authenticated;

alter table public.affiliates enable row level security;
alter table public.affiliate_referral_links enable row level security;
alter table public.affiliate_click_events enable row level security;

drop policy if exists affiliates_select_own on public.affiliates;
create policy affiliates_select_own on public.affiliates
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists affiliates_update_own on public.affiliates;
create policy affiliates_update_own on public.affiliates
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists affiliate_links_select_own on public.affiliate_referral_links;
create policy affiliate_links_select_own on public.affiliate_referral_links
  for select to authenticated
  using (
    affiliate_id in (
      select a.id from public.affiliates a where a.user_id = auth.uid()
    )
  );

drop policy if exists affiliate_clicks_select_own on public.affiliate_click_events;
create policy affiliate_clicks_select_own on public.affiliate_click_events
  for select to authenticated
  using (
    affiliate_id in (
      select a.id from public.affiliates a where a.user_id = auth.uid()
    )
  );

grant select on public.affiliates to authenticated;
grant select on public.affiliate_referral_links to authenticated;
grant select on public.affiliate_click_events to authenticated;

do $$
declare
  affiliate_row record;
  partner_row record;
begin
  for affiliate_row in select id from public.affiliates loop
    perform public.sync_affiliate_referral_links_for_affiliate(affiliate_row.id);
  end loop;

  for partner_row in select id from public.partners where affiliate_enabled = true loop
    perform public.sync_affiliate_referral_links_for_partner(partner_row.id);
  end loop;
end $$;

notify pgrst, 'reload schema';
