-- Ensure paid upgrade creates member row when skipping trial signup

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
    coalesce(p_renewal_date, now() + interval '1 month'),
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
end;
$$;
