-- Idempotent setup for member free-trial signup (run in Supabase SQL editor if migrations are not linked)

alter table public.system_settings
  add column if not exists membership_price_monthly numeric(10, 2) default 20.00,
  add column if not exists trial_length_days integer default 7;

update public.system_settings
set membership_price_monthly = coalesce(membership_price_monthly, 20.00),
    trial_length_days = coalesce(trial_length_days, 7);

alter table public.members
  add column if not exists auth_user_id uuid references auth.users (id) on delete cascade,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists country text default 'New Zealand',
  add column if not exists location text default 'New Zealand',
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists membership_status text not null default 'trialing',
  add column if not exists status text not null default 'TRIAL',
  add column if not exists subscription_status text not null default 'TRIAL',
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists renewal_date timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists joined_at timestamptz not null default now();

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

create unique index if not exists members_auth_user_id_idx
  on public.members (auth_user_id);

alter table public.members drop constraint if exists members_membership_status_check;

alter table public.members
  add constraint members_membership_status_check
  check (membership_status in ('trialing', 'trial', 'active', 'expired', 'cancelled'));

update public.members
set membership_status = 'trialing'
where membership_status = 'trial';

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
    id,
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

  return v_member_id;
end;
$$;

grant execute on function public.start_member_trial(text, text, text, boolean) to authenticated;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'members'
      and column_name = 'auth_user_id'
  )
  and not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'members'
      and policyname = 'Members read own profile'
  ) then
    create policy "Members read own profile"
      on public.members for select
      using (auth.uid() = auth_user_id);
  end if;
end;
$$;
