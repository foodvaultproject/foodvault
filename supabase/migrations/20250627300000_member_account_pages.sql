-- Member account pages: memberships table, views, and member self-service policies

-- Prerequisite for databases where members predates auth_user_id linkage
alter table public.members
  add column if not exists auth_user_id uuid references auth.users (id) on delete cascade,
  add column if not exists country text,
  add column if not exists membership_status text,
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists renewal_date timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'members'
      and column_name = 'user_id'
  ) then
    update public.members
    set auth_user_id = user_id
    where auth_user_id is null
      and user_id is not null;
  end if;
end;
$$;

update public.members
set auth_user_id = id
where auth_user_id is null;

create unique index if not exists members_auth_user_id_idx
  on public.members (auth_user_id);

alter table public.members
  add column if not exists deleted_at timestamptz,
  add column if not exists location text default 'New Zealand';

update public.members
set location = coalesce(location, country, 'New Zealand')
where location is null or location = '';

-- Align membership_status values with account UI ('trialing' instead of 'trial')
alter table public.members drop constraint if exists members_membership_status_check;

update public.members
set membership_status = 'trialing'
where membership_status = 'trial';

alter table public.members
  add constraint members_membership_status_check
  check (membership_status in ('trialing', 'active', 'expired', 'cancelled'));

alter table public.partners
  add column if not exists banner_image_url text,
  add column if not exists logo_url text;

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'cancelled', 'expired')),
  renewal_date timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  billing_frequency text not null default 'monthly',
  cancellation_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memberships_auth_user_id_idx on public.memberships (auth_user_id);

alter table public.memberships enable row level security;

drop policy if exists "Members read own membership" on public.memberships;
create policy "Members read own membership"
  on public.memberships for select
  using (auth.uid() = auth_user_id);

drop policy if exists "Members update own membership" on public.memberships;
create policy "Members update own membership"
  on public.memberships for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

drop policy if exists "Members insert own membership" on public.memberships;
create policy "Members insert own membership"
  on public.memberships for insert
  with check (auth.uid() = auth_user_id);

drop policy if exists "Members update own profile" on public.members;
create policy "Members update own profile"
  on public.members for update
  using (auth.uid() = auth_user_id and deleted_at is null)
  with check (auth.uid() = auth_user_id);

drop policy if exists "Authenticated read live partners" on public.partners;
create policy "Authenticated read live partners"
  on public.partners for select
  to authenticated
  using (
    application_status_v2 = 'APPROVED'
    and listing_status_v2 = 'LIVE'
    and coalesce(suspended, false) = false
  );

drop view if exists public.v_trial_banner cascade;

create or replace view public.v_trial_banner as
select
  m.auth_user_id as member_id,
  m.email,
  m.first_name,
  m.membership_status,
  case
    when m.membership_status = 'trialing' then 'trialing'
    when m.membership_status = 'expired' then 'expired'
    else 'inactive'
  end as trial_status,
  m.trial_ends_at as trial_end_at,
  (
    m.membership_status = 'trialing'
    and m.deleted_at is null
  ) as show_trial_banner,
  greatest(
    0,
    (m.trial_ends_at::date - current_date)
  )::integer as days_remaining,
  ss.trial_length_days,
  ss.membership_price_monthly
from public.members m
cross join (
  select trial_length_days, membership_price_monthly
  from public.system_settings
  limit 1
) ss
where m.deleted_at is null;

grant select on public.v_trial_banner to authenticated;

drop view if exists public.v_active_partners cascade;

create or replace view public.v_active_partners as
select
  p.id,
  p.business_name,
  p.website_url,
  coalesce(p.primary_category, 'Food & Beverage') as category,
  coalesce(p.location, 'New Zealand') as location,
  p.banner_image_url,
  p.logo_url,
  p.approved_at
from public.partners p
where p.application_status_v2 = 'APPROVED'
  and p.listing_status_v2 = 'LIVE'
  and coalesce(p.suspended, false) = false
order by p.approved_at desc nulls last;

grant select on public.v_active_partners to authenticated;

create or replace function public.sync_membership_record(
  p_auth_user_id uuid,
  p_status text,
  p_stripe_customer_id text default null,
  p_stripe_subscription_id text default null,
  p_renewal_date timestamptz default null,
  p_cancellation_date timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id uuid;
begin
  select id into v_member_id
  from public.members
  where auth_user_id = p_auth_user_id
    and deleted_at is null;

  if v_member_id is null then
    return;
  end if;

  insert into public.memberships (
    member_id,
    auth_user_id,
    status,
    stripe_customer_id,
    stripe_subscription_id,
    renewal_date,
    cancellation_date,
    billing_frequency
  )
  values (
    v_member_id,
    p_auth_user_id,
    p_status,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_renewal_date,
    p_cancellation_date,
    'monthly'
  )
  on conflict (auth_user_id) do update set
    status = excluded.status,
    stripe_customer_id = coalesce(excluded.stripe_customer_id, public.memberships.stripe_customer_id),
    stripe_subscription_id = coalesce(excluded.stripe_subscription_id, public.memberships.stripe_subscription_id),
    renewal_date = coalesce(excluded.renewal_date, public.memberships.renewal_date),
    cancellation_date = excluded.cancellation_date,
    updated_at = now();
end;
$$;

create or replace function public.start_member_trial(
  p_first_name text,
  p_last_name text,
  p_country text default 'New Zealand',
  p_marketing_opt_in boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_trial_days integer;
  v_member_id uuid;
  v_trial_end timestamptz;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select email into v_email from auth.users where id = v_user_id;
  select trial_length_days into v_trial_days
  from public.system_settings
  limit 1;
  v_trial_end := now() + make_interval(days => coalesce(v_trial_days, 7));

  insert into public.members (
    auth_user_id,
    email,
    full_name,
    first_name,
    last_name,
    country,
    location,
    marketing_opt_in,
    status,
    subscription_status,
    membership_status,
    trial_started_at,
    trial_ends_at,
    joined_at
  )
  values (
    v_user_id,
    v_email,
    trim(p_first_name || ' ' || p_last_name),
    p_first_name,
    p_last_name,
    p_country,
    p_country,
    p_marketing_opt_in,
    'TRIAL',
    'TRIAL',
    'trialing',
    now(),
    v_trial_end,
    now()
  )
  on conflict (auth_user_id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    full_name = excluded.full_name,
    country = excluded.country,
    location = excluded.location,
    marketing_opt_in = excluded.marketing_opt_in,
    membership_status = case
      when public.members.membership_status = 'active' then public.members.membership_status
      else 'trialing'
    end,
    status = case
      when public.members.membership_status = 'active' then public.members.status
      else 'TRIAL'
    end,
    subscription_status = case
      when public.members.membership_status = 'active' then public.members.subscription_status
      else 'TRIAL'
    end,
    trial_started_at = coalesce(public.members.trial_started_at, excluded.trial_started_at),
    trial_ends_at = coalesce(public.members.trial_ends_at, excluded.trial_ends_at),
    deleted_at = null
  returning id into v_member_id;

  perform public.sync_membership_record(
    v_user_id,
    'trialing',
    null,
    null,
    v_trial_end,
    null
  );

  return v_member_id;
end;
$$;

create or replace function public.upgrade_to_paid_membership(
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_renewal_date timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_renewal timestamptz := coalesce(p_renewal_date, now() + interval '1 month');
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select email into v_email from auth.users where id = v_user_id;

  insert into public.members (
    auth_user_id,
    email,
    membership_status,
    status,
    subscription_status,
    stripe_customer_id,
    stripe_subscription_id,
    renewal_date,
    joined_at
  )
  values (
    v_user_id,
    v_email,
    'active',
    'ACTIVE',
    'ACTIVE',
    p_stripe_customer_id,
    p_stripe_subscription_id,
    v_renewal,
    now()
  )
  on conflict (auth_user_id) do update set
    membership_status = 'active',
    status = 'ACTIVE',
    subscription_status = 'ACTIVE',
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    renewal_date = excluded.renewal_date,
    trial_ends_at = null;

  perform public.sync_membership_record(
    v_user_id,
    'active',
    p_stripe_customer_id,
    p_stripe_subscription_id,
    v_renewal,
    null
  );
end;
$$;

create or replace function public.upgrade_to_paid_membership_webhook(
  p_auth_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_renewal_date timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_renewal timestamptz := coalesce(p_renewal_date, now() + interval '1 month');
begin
  select email into v_email from auth.users where id = p_auth_user_id;

  insert into public.members (
    auth_user_id,
    email,
    membership_status,
    status,
    subscription_status,
    stripe_customer_id,
    stripe_subscription_id,
    renewal_date,
    joined_at
  )
  values (
    p_auth_user_id,
    v_email,
    'active',
    'ACTIVE',
    'ACTIVE',
    p_stripe_customer_id,
    p_stripe_subscription_id,
    v_renewal,
    now()
  )
  on conflict (auth_user_id) do update set
    membership_status = 'active',
    status = 'ACTIVE',
    subscription_status = 'ACTIVE',
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    renewal_date = excluded.renewal_date,
    trial_ends_at = null;

  perform public.sync_membership_record(
    p_auth_user_id,
    'active',
    p_stripe_customer_id,
    p_stripe_subscription_id,
    v_renewal,
    null
  );
end;
$$;

create or replace function public.end_member_trial_early()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  update public.members
  set
    membership_status = 'expired',
    status = 'EXPIRED',
    subscription_status = 'EXPIRED',
    trial_ends_at = now()
  where auth_user_id = v_user_id
    and deleted_at is null;

  perform public.sync_membership_record(v_user_id, 'expired', null, null, null, null);
end;
$$;

create or replace function public.mark_membership_cancelled(
  p_cancellation_date timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  update public.members
  set
    membership_status = 'cancelled',
    status = 'CANCELLED',
    subscription_status = 'CANCELLED'
  where auth_user_id = v_user_id
    and deleted_at is null;

  perform public.sync_membership_record(
    v_user_id,
    'cancelled',
    null,
    null,
    null,
    p_cancellation_date
  );
end;
$$;

create or replace function public.soft_delete_member_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  update public.members
  set deleted_at = now()
  where auth_user_id = v_user_id;

  update public.memberships
  set status = 'expired', updated_at = now()
  where auth_user_id = v_user_id;
end;
$$;

grant execute on function public.end_member_trial_early() to authenticated;
grant execute on function public.mark_membership_cancelled(timestamptz) to authenticated;
grant execute on function public.soft_delete_member_account() to authenticated;
grant execute on function public.upgrade_to_paid_membership_webhook(uuid, text, text, timestamptz) to service_role;
