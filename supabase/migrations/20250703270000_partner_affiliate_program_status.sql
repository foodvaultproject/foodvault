-- Partner Affiliate Program status dashboard

create or replace function public.get_partner_affiliate_program_status(p_partner_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_partner public.partners%rowtype;
  v_integration public.store_integrations%rowtype;
  v_billing public.partner_billing_profiles%rowtype;
  v_latest_click timestamptz;
  v_latest_sale timestamptz;
  v_orders_today bigint;
  v_total_orders bigint;
  v_last_order timestamptz;
  v_pending_commission numeric := 0;
  v_approved_commission numeric := 0;
  v_paid_commission numeric := 0;
  v_total_commission numeric := 0;
  v_pending_payouts bigint := 0;
  v_pending_payout_amount numeric := 0;
  v_total_paid numeric := 0;
  v_outstanding numeric := 0;
  v_next_month timestamptz;
begin
  if not exists (
    select 1 from public.partners p where p.id = p_partner_id and p.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  select * into v_partner from public.partners where id = p_partner_id;

  if not coalesce(v_partner.affiliate_enabled, false) then
    return json_build_object('enabled', false);
  end if;

  select * into v_integration
  from public.store_integrations si
  where si.partner_id = p_partner_id and si.platform = 'shopify'
  order by si.connected_at desc nulls last
  limit 1;

  select * into v_billing
  from public.partner_billing_profiles
  where partner_id = p_partner_id;

  select max(e.clicked_at) into v_latest_click
  from public.affiliate_click_events e
  where e.partner_id = p_partner_id;

  select max(o.order_date) into v_latest_sale
  from public.commission_records cr
  join public.store_orders o on o.id = cr.order_id
  where cr.partner_id = p_partner_id
    and cr.status not in ('cancelled');

  select count(*) into v_orders_today
  from public.commission_records cr
  join public.store_orders o on o.id = cr.order_id
  where cr.partner_id = p_partner_id
    and cr.status not in ('cancelled')
    and o.order_date >= date_trunc('day', now());

  select count(*) into v_total_orders
  from public.commission_records cr
  where cr.partner_id = p_partner_id
    and cr.status not in ('cancelled');

  select max(o.order_date) into v_last_order
  from public.commission_records cr
  join public.store_orders o on o.id = cr.order_id
  where cr.partner_id = p_partner_id
    and cr.status not in ('cancelled');

  select
    coalesce(sum(commission_value) filter (where status = 'pending'), 0),
    coalesce(sum(commission_value) filter (where status = 'approved'), 0),
    coalesce(sum(commission_value) filter (where status = 'paid'), 0),
    coalesce(sum(commission_value) filter (where status not in ('cancelled', 'refunded')), 0)
  into v_pending_commission, v_approved_commission, v_paid_commission, v_total_commission
  from public.commission_records
  where partner_id = p_partner_id;

  select count(*), coalesce(sum(pi.amount), 0)
  into v_pending_payouts, v_pending_payout_amount
  from public.payout_items pi
  join public.commission_records cr on cr.id = pi.commission_id
  where cr.partner_id = p_partner_id
    and pi.status in ('pending', 'processing');

  select coalesce(sum(pi.amount), 0) into v_total_paid
  from public.payout_items pi
  join public.commission_records cr on cr.id = pi.commission_id
  where cr.partner_id = p_partner_id
    and pi.status = 'paid';

  select coalesce(sum(gross_commission), 0) into v_outstanding
  from public.billing_invoices
  where partner_id = p_partner_id
    and status in ('open', 'failed');

  v_next_month := date_trunc('month', now()) + interval '1 month';

  return json_build_object(
    'enabled', true,
    'shopify', json_build_object(
      'connected', coalesce(v_integration.status = 'connected', false),
      'status', coalesce(v_integration.status, 'not_connected'),
      'store_url', coalesce(v_integration.store_url, v_integration.external_store_id),
      'store_name', v_integration.store_name,
      'connected_at', v_integration.connected_at,
      'last_successful_connection', coalesce(v_integration.last_sync_at, v_integration.connected_at)
    ),
    'tracking', json_build_object(
      'latest_click_at', v_latest_click,
      'latest_sale_at', v_latest_sale,
      'total_clicks', (select count(*) from public.affiliate_click_events where partner_id = p_partner_id)
    ),
    'affiliate_orders', json_build_object(
      'orders_today', coalesce(v_orders_today, 0),
      'total_orders', coalesce(v_total_orders, 0),
      'last_order_at', v_last_order,
      'last_sync_at', v_integration.last_sync_at
    ),
    'commissions', json_build_object(
      'pending', v_pending_commission,
      'approved', v_approved_commission,
      'paid', v_paid_commission,
      'total', v_total_commission
    ),
    'payouts', json_build_object(
      'next_scheduled_at', v_next_month,
      'pending_count', coalesce(v_pending_payouts, 0),
      'pending_amount', coalesce(v_pending_payout_amount, 0),
      'total_paid', coalesce(v_total_paid, 0)
    ),
    'billing', json_build_object(
      'configured', coalesce(v_billing.billing_status in ('active', 'past_due'), false),
      'billing_status', coalesce(v_billing.billing_status, 'none'),
      'has_payment_method', v_billing.default_payment_method_id is not null,
      'next_billing_date', v_next_month,
      'outstanding_balance', v_outstanding
    ),
    'recent_activity', coalesce((
      select json_agg(row_to_json(t)) from (
        select activity_type, label, occurred_at
        from (
          select
            'affiliate_joined'::text as activity_type,
            'Affiliate joined your program'::text as label,
            arl.created_at as occurred_at
          from public.affiliate_referral_links arl
          where arl.partner_id = p_partner_id

          union all

          select
            'referral_click',
            'Referral link clicked',
            e.clicked_at
          from public.affiliate_click_events e
          where e.partner_id = p_partner_id

          union all

          select
            'affiliate_order',
            'Affiliate order recorded',
            o.order_date
          from public.commission_records cr
          join public.store_orders o on o.id = cr.order_id
          where cr.partner_id = p_partner_id

          union all

          select
            'commission_created',
            'Commission created',
            cr.created_at
          from public.commission_records cr
          where cr.partner_id = p_partner_id

          union all

          select
            'commission_approved',
            'Commission approved',
            cr.approved_at
          from public.commission_records cr
          where cr.partner_id = p_partner_id
            and cr.approved_at is not null

          union all

          select
            'affiliate_paid',
            'Affiliate paid',
            coalesce(pi.paid_at, pi.created_at)
          from public.payout_items pi
          join public.commission_records cr on cr.id = pi.commission_id
          where cr.partner_id = p_partner_id
            and pi.status = 'paid'
        ) events
        where occurred_at is not null
        order by occurred_at desc
        limit 20
      ) t
    ), '[]'::json)
  );
end;
$$;

grant execute on function public.get_partner_affiliate_program_status(uuid) to authenticated;

notify pgrst, 'reload schema';
