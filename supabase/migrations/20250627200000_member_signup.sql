-- Member signup, trial banner, and Stripe membership

alter table public.system_settings
  add column if not exists membership_price_monthly numeric(10, 2);

update public.system_settings
set membership_price_monthly = coalesce(membership_price_monthly, membership_price_nzd, 20.00)
where id = 1;

alter table public.members
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists country text default 'New Zealand',
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists membership_status text not null default 'trial'
    check (membership_status in ('trial', 'active', 'expired', 'cancelled')),
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists renewal_date timestamptz;

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
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select email into v_email from auth.users where id = v_user_id;
  select trial_length_days into v_trial_days from public.system_settings where id = 1;

  insert into public.members (
    auth_user_id,
    email,
    full_name,
    first_name,
    last_name,
    country,
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
    p_marketing_opt_in,
    'TRIAL',
    'TRIAL',
    'trial',
    now(),
    now() + make_interval(days => coalesce(v_trial_days, 7)),
    now()
  )
  on conflict (auth_user_id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    full_name = excluded.full_name,
    country = excluded.country,
    marketing_opt_in = excluded.marketing_opt_in,
    membership_status = case
      when public.members.membership_status = 'active' then public.members.membership_status
      else 'trial'
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
    trial_ends_at = coalesce(public.members.trial_ends_at, excluded.trial_ends_at)
  returning id into v_member_id;

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
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.members
  set
    membership_status = 'active',
    status = 'ACTIVE',
    subscription_status = 'ACTIVE',
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    renewal_date = coalesce(p_renewal_date, now() + interval '1 month'),
    trial_ends_at = null
  where auth_user_id = auth.uid();
end;
$$;

create or replace view public.v_trial_banner as
select
  m.auth_user_id as member_id,
  m.email,
  m.membership_status,
  (m.membership_status = 'trial') as show_trial_banner,
  greatest(
    0,
    (m.trial_ends_at::date - current_date)
  )::integer as days_remaining,
  ss.trial_length_days,
  ss.membership_price_monthly
from public.members m
cross join public.system_settings ss
where ss.id = 1
  and m.membership_status = 'trial';

grant select on public.v_trial_banner to authenticated;

create policy "Members read own trial banner"
  on public.members for select
  using (auth.uid() = auth_user_id);
