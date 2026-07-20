-- Period-end cancellation access fixes:
-- 1) Persist cancel_at_period_end on memberships
-- 2) Discount-code RPC must not lock out paid members who scheduled cancel
-- 3) mark_membership_cancelled must NOT flip status to cancelled immediately

alter table public.memberships
  add column if not exists cancel_at_period_end boolean not null default false;

-- Shared access rule used by discount-code gating (and kept in sync with app checks).
create or replace function public.member_has_active_access(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_uid is not null
    and (
      exists (
        select 1
        from public.members m
        where m.deleted_at is null
          and (m.auth_user_id = p_uid or m.id = p_uid)
          and (
            m.membership_status in ('trialing', 'active', 'trial')
            or (
              m.stripe_subscription_id is not null
              and length(trim(m.stripe_subscription_id)) > 0
            )
            or (
              m.membership_status in ('cancelled', 'canceled', 'CANCELLED', 'CANCELED')
              and m.renewal_date is not null
              and m.renewal_date > now()
            )
          )
      )
      or exists (
        select 1
        from public.memberships ms
        where ms.auth_user_id = p_uid
          and (
            ms.status in ('trialing', 'active', 'trial')
            or (
              ms.stripe_subscription_id is not null
              and length(trim(ms.stripe_subscription_id)) > 0
            )
            or (
              coalesce(ms.cancel_at_period_end, false) = true
              and coalesce(ms.renewal_date, ms.cancellation_date) is not null
              and coalesce(ms.renewal_date, ms.cancellation_date) > now()
            )
            or (
              ms.status in ('cancelled', 'canceled')
              and coalesce(ms.renewal_date, ms.cancellation_date) is not null
              and coalesce(ms.renewal_date, ms.cancellation_date) > now()
            )
          )
      )
    );
$$;

create or replace function public.get_partner_discount_code(p_partner_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_owner uuid;
  v_is_live boolean;
begin
  select member_code, user_id,
         (application_status_v2 = 'APPROVED'
          and listing_status_v2 = 'LIVE'
          and coalesce(suspended, false) = false)
    into v_code, v_owner, v_is_live
  from public.partners
  where id = p_partner_id;

  if v_code is null then return null; end if;
  if public.is_admin() then return v_code; end if;
  if v_uid is null then return null; end if;
  if v_owner = v_uid then return v_code; end if;

  if v_is_live and public.member_has_active_access(v_uid) then
    return v_code;
  end if;

  return null;
end;
$$;

-- Atomic activate: keep status active; record cancel_at_period_end when scheduled.
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
  v_cancel_at_period_end boolean := p_cancellation_date is not null;
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

  -- Status stays 'active' even when cancellation is scheduled for period end.
  perform public.sync_membership_record(
    p_auth_user_id,
    'active',
    p_stripe_customer_id,
    p_stripe_subscription_id,
    v_renewal,
    p_cancellation_date
  );

  update public.memberships
  set
    cancel_at_period_end = v_cancel_at_period_end,
    updated_at = now()
  where auth_user_id = p_auth_user_id;

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
    cancel_at_period_end = true,
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
    cancel_at_period_end = false,
    updated_at = now()
  where auth_user_id = p_auth_user_id;
end;
$$;

-- Legacy client RPC: never revoke mid-period. Keep access active and only schedule.
create or replace function public.mark_membership_cancelled(
  p_cancellation_date timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cancellation timestamptz;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(
    p_cancellation_date,
    m.renewal_date,
    ms.renewal_date,
    now()
  )
  into v_cancellation
  from public.members m
  left join public.memberships ms on ms.auth_user_id = v_user_id
  where m.deleted_at is null
    and (m.auth_user_id = v_user_id or m.id = v_user_id)
  limit 1;

  v_cancellation := coalesce(v_cancellation, now());

  perform public.schedule_member_cancellation_from_stripe(
    v_user_id,
    v_cancellation
  );
end;
$$;

grant execute on function public.member_has_active_access(uuid) to service_role;
grant execute on function public.get_partner_discount_code(uuid) to anon, authenticated;
grant execute on function public.activate_member_from_stripe(uuid, text, text, timestamptz, timestamptz) to service_role;
grant execute on function public.schedule_member_cancellation_from_stripe(uuid, timestamptz) to service_role;
grant execute on function public.revoke_member_from_stripe(uuid, timestamptz) to service_role;
grant execute on function public.mark_membership_cancelled(timestamptz) to authenticated;
