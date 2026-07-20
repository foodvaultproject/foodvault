-- Atomic Stripe membership state transitions.
-- Each function updates members + memberships in a single Postgres transaction
-- so webhook retries cannot leave partial membership state.

create or replace function public.activate_member_from_stripe(
  p_auth_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_renewal_date timestamptz default null,
  p_cancellation_date timestamptz default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_renewal timestamptz := coalesce(p_renewal_date, now() + interval '1 month');
  v_was_paid boolean := false;
begin
  if p_auth_user_id is null then
    raise exception 'auth_user_id is required';
  end if;
  if p_stripe_customer_id is null or length(trim(p_stripe_customer_id)) = 0 then
    raise exception 'stripe_customer_id is required';
  end if;
  if p_stripe_subscription_id is null or length(trim(p_stripe_subscription_id)) = 0 then
    raise exception 'stripe_subscription_id is required';
  end if;

  select exists (
    select 1
    from public.members
    where deleted_at is null
      and (auth_user_id = p_auth_user_id or id = p_auth_user_id)
      and stripe_subscription_id is not null
      and length(trim(stripe_subscription_id)) > 0
  )
  into v_was_paid;

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
    joined_at,
    trial_ends_at,
    trial_started_at
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
    now(),
    null,
    null
  )
  on conflict (auth_user_id) do update set
    membership_status = 'active',
    status = 'ACTIVE',
    subscription_status = 'ACTIVE',
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    renewal_date = excluded.renewal_date,
    trial_ends_at = null,
    trial_started_at = null;

  -- Keep any duplicate/legacy rows (matched by id) aligned in the same transaction.
  update public.members
  set
    membership_status = 'active',
    status = 'ACTIVE',
    subscription_status = 'ACTIVE',
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    renewal_date = v_renewal,
    trial_ends_at = null,
    trial_started_at = null
  where deleted_at is null
    and (auth_user_id = p_auth_user_id or id = p_auth_user_id);

  perform public.sync_membership_record(
    p_auth_user_id,
    'active',
    p_stripe_customer_id,
    p_stripe_subscription_id,
    v_renewal,
    p_cancellation_date
  );

  -- true = newly activated (caller may send welcome email)
  return not v_was_paid;
end;
$$;

create or replace function public.schedule_member_cancellation_from_stripe(
  p_auth_user_id uuid,
  p_cancellation_date timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cancellation timestamptz := coalesce(p_cancellation_date, now());
begin
  if p_auth_user_id is null then
    raise exception 'auth_user_id is required';
  end if;

  -- Access remains active until Stripe ends the subscription; only record schedule.
  update public.members
  set
    membership_status = 'active',
    status = 'ACTIVE',
    subscription_status = 'ACTIVE'
  where deleted_at is null
    and (auth_user_id = p_auth_user_id or id = p_auth_user_id);

  update public.memberships
  set
    status = 'active',
    cancellation_date = v_cancellation,
    updated_at = now()
  where auth_user_id = p_auth_user_id;
end;
$$;

create or replace function public.revoke_member_from_stripe(
  p_auth_user_id uuid,
  p_cancellation_date timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cancellation timestamptz := coalesce(p_cancellation_date, now());
begin
  if p_auth_user_id is null then
    raise exception 'auth_user_id is required';
  end if;

  -- Clearing stripe_subscription_id is required: the app treats any non-null
  -- subscription id as paid access.
  update public.members
  set
    membership_status = 'cancelled',
    status = 'CANCELLED',
    subscription_status = 'CANCELLED',
    stripe_subscription_id = null,
    renewal_date = null
  where deleted_at is null
    and (auth_user_id = p_auth_user_id or id = p_auth_user_id);

  update public.memberships
  set
    status = 'cancelled',
    stripe_subscription_id = null,
    cancellation_date = v_cancellation,
    updated_at = now()
  where auth_user_id = p_auth_user_id;
end;
$$;

-- Keep the legacy webhook helper as a thin wrapper for any older callers.
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
begin
  perform public.activate_member_from_stripe(
    p_auth_user_id,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_renewal_date,
    null
  );
end;
$$;

grant execute on function public.activate_member_from_stripe(uuid, text, text, timestamptz, timestamptz) to service_role;
grant execute on function public.schedule_member_cancellation_from_stripe(uuid, timestamptz) to service_role;
grant execute on function public.revoke_member_from_stripe(uuid, timestamptz) to service_role;
grant execute on function public.upgrade_to_paid_membership_webhook(uuid, text, text, timestamptz) to service_role;
