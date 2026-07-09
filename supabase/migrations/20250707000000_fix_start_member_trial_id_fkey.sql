-- Trial signup: members.id references auth.users(id), so new rows must use the auth user id.

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

grant execute on function public.start_member_trial(text, text, text, boolean) to authenticated;

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
    id,
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

grant execute on function public.upgrade_to_paid_membership_webhook(uuid, text, text, timestamptz) to service_role;
