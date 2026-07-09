-- Webhook-safe paid membership upgrade (no auth session required)

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

grant execute on function public.upgrade_to_paid_membership_webhook(uuid, text, text, timestamptz) to service_role;
