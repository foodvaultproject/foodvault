-- Affiliate Program Phase 5: Payment Service, Partner Billing & Stripe Connect Payouts

alter table public.affiliates
  alter column bank_account_name drop not null,
  alter column bank_account_number drop not null;

-- ---------------------------------------------------------------------------
-- Payout accounts (provider-agnostic; Stripe Connect first)
-- ---------------------------------------------------------------------------

create table if not exists public.payout_accounts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null unique references public.affiliates(id) on delete cascade,
  provider text not null default 'stripe_connect',
  external_account_id text not null,
  onboarding_status text not null default 'pending',
  payouts_enabled boolean not null default false,
  charges_enabled boolean not null default false,
  details_submitted boolean not null default false,
  default_currency text not null default 'NZD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payout_accounts_provider_check check (
    provider in ('stripe_connect', 'wise', 'airwallex', 'paypal', 'bank_transfer')
  ),
  constraint payout_accounts_onboarding_status_check check (
    onboarding_status in ('pending', 'restricted', 'complete')
  )
);

create index if not exists payout_accounts_external_idx
  on public.payout_accounts (provider, external_account_id);

-- ---------------------------------------------------------------------------
-- Partner billing profiles
-- ---------------------------------------------------------------------------

create table if not exists public.partner_billing_profiles (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null unique references public.partners(id) on delete cascade,
  provider text not null default 'stripe',
  external_customer_id text not null,
  default_payment_method_id text,
  billing_status text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_billing_profiles_status_check check (
    billing_status in ('none', 'active', 'past_due', 'disabled')
  )
);

create index if not exists partner_billing_profiles_external_idx
  on public.partner_billing_profiles (provider, external_customer_id);

-- ---------------------------------------------------------------------------
-- Partner commission invoices
-- ---------------------------------------------------------------------------

create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  invoice_number text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  gross_commission numeric(12, 2) not null,
  currency text not null default 'NZD',
  status text not null default 'open',
  external_payment_intent_id text,
  idempotency_key text not null unique,
  paid_at timestamptz,
  failed_at timestamptz,
  failure_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_invoices_status_check check (
    status in ('draft', 'open', 'paid', 'failed', 'void')
  )
);

create index if not exists billing_invoices_partner_idx
  on public.billing_invoices (partner_id, created_at desc);

create table if not exists public.billing_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.billing_invoices(id) on delete cascade,
  commission_id uuid not null unique references public.commission_records(id) on delete cascade,
  amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists billing_invoice_items_invoice_idx
  on public.billing_invoice_items (invoice_id);

-- ---------------------------------------------------------------------------
-- Affiliate payout batches
-- ---------------------------------------------------------------------------

create table if not exists public.payout_batches (
  id uuid primary key default gen_random_uuid(),
  period_start timestamptz not null,
  period_end timestamptz not null,
  status text not null default 'draft',
  total_amount numeric(12, 2) not null default 0,
  currency text not null default 'NZD',
  provider text not null default 'stripe_connect',
  idempotency_key text not null unique,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payout_batches_status_check check (
    status in ('draft', 'processing', 'completed', 'failed')
  )
);

create table if not exists public.payout_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.payout_batches(id) on delete cascade,
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  commission_id uuid not null unique references public.commission_records(id) on delete cascade,
  amount numeric(12, 2) not null,
  currency text not null default 'NZD',
  status text not null default 'pending',
  external_transfer_id text,
  external_payout_id text,
  idempotency_key text not null unique,
  paid_at timestamptz,
  failed_at timestamptz,
  failure_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payout_items_status_check check (
    status in ('pending', 'processing', 'paid', 'failed')
  )
);

create index if not exists payout_items_batch_idx on public.payout_items (batch_id);
create index if not exists payout_items_affiliate_idx on public.payout_items (affiliate_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Updated affiliate registration (no bank required)
-- ---------------------------------------------------------------------------

create or replace function public.register_affiliate(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_country text,
  p_payment_country text,
  p_bank_account_name text default null,
  p_bank_account_number text default null,
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
    user_id, first_name, last_name, email, country, payment_country,
    bank_account_name, bank_account_number, tax_number, referral_code, status
  ) values (
    v_uid,
    trim(p_first_name),
    trim(p_last_name),
    lower(trim(p_email)),
    coalesce(nullif(trim(p_country), ''), 'New Zealand'),
    coalesce(nullif(trim(p_payment_country), ''), 'New Zealand'),
    nullif(trim(coalesce(p_bank_account_name, '')), ''),
    nullif(trim(coalesce(p_bank_account_number, '')), ''),
    nullif(trim(coalesce(p_tax_number, '')), ''),
    public.generate_affiliate_referral_code(),
    'ACTIVE'
  )
  on conflict (user_id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    country = excluded.country,
    payment_country = excluded.payment_country,
    bank_account_name = coalesce(excluded.bank_account_name, affiliates.bank_account_name),
    bank_account_number = coalesce(excluded.bank_account_number, affiliates.bank_account_number),
    tax_number = excluded.tax_number,
    updated_at = now()
  returning * into v_row;

  perform public.sync_affiliate_referral_links_for_affiliate(v_row.id);
  return to_jsonb(v_row)::json;
end;
$$;

-- ---------------------------------------------------------------------------
-- Payout account reads
-- ---------------------------------------------------------------------------

create or replace function public.get_affiliate_payout_account(p_affiliate_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_row public.payout_accounts%rowtype;
begin
  if not exists (
    select 1 from public.affiliates a
    where a.id = p_affiliate_id and a.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  select * into v_row from public.payout_accounts where affiliate_id = p_affiliate_id;

  if v_row.id is null then
    return json_build_object('connected', false);
  end if;

  return json_build_object(
    'connected', true,
    'provider', v_row.provider,
    'onboarding_status', v_row.onboarding_status,
    'payouts_enabled', v_row.payouts_enabled,
    'details_submitted', v_row.details_submitted,
    'default_currency', v_row.default_currency,
    'updated_at', v_row.updated_at
  );
end;
$$;

grant execute on function public.get_affiliate_payout_account(uuid) to authenticated;

create or replace function public.get_partner_billing_profile(p_partner_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_row public.partner_billing_profiles%rowtype;
begin
  if not exists (
    select 1 from public.partners p where p.id = p_partner_id and p.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  select * into v_row from public.partner_billing_profiles where partner_id = p_partner_id;

  if v_row.id is null then
    return json_build_object('configured', false);
  end if;

  return json_build_object(
    'configured', v_row.billing_status in ('active', 'past_due'),
    'provider', v_row.provider,
    'billing_status', v_row.billing_status,
    'has_payment_method', v_row.default_payment_method_id is not null,
    'updated_at', v_row.updated_at
  );
end;
$$;

grant execute on function public.get_partner_billing_profile(uuid) to authenticated;

create or replace function public.get_affiliate_payout_history(
  p_affiliate_id uuid,
  p_limit integer default 20
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.affiliates a
    where a.id = p_affiliate_id and a.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  return coalesce((
    select json_agg(row_to_json(t)) from (
      select
        pi.id,
        pi.amount,
        pi.currency,
        pi.status,
        pi.paid_at,
        pi.created_at,
        pb.period_start,
        pb.period_end
      from public.payout_items pi
      join public.payout_batches pb on pb.id = pi.batch_id
      where pi.affiliate_id = p_affiliate_id
      order by pi.created_at desc
      limit greatest(1, least(p_limit, 100))
    ) t
  ), '[]'::json);
end;
$$;

grant execute on function public.get_affiliate_payout_history(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Service-role payment operations
-- ---------------------------------------------------------------------------

create or replace function public.upsert_payout_account(
  p_affiliate_id uuid,
  p_provider text,
  p_external_account_id text,
  p_onboarding_status text,
  p_payouts_enabled boolean,
  p_charges_enabled boolean,
  p_details_submitted boolean,
  p_default_currency text default 'NZD'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  insert into public.payout_accounts (
    affiliate_id, provider, external_account_id, onboarding_status,
    payouts_enabled, charges_enabled, details_submitted, default_currency
  ) values (
    p_affiliate_id, p_provider, p_external_account_id, p_onboarding_status,
    p_payouts_enabled, p_charges_enabled, p_details_submitted,
    upper(coalesce(nullif(trim(p_default_currency), ''), 'NZD'))
  )
  on conflict (affiliate_id) do update set
    external_account_id = excluded.external_account_id,
    onboarding_status = excluded.onboarding_status,
    payouts_enabled = excluded.payouts_enabled,
    charges_enabled = excluded.charges_enabled,
    details_submitted = excluded.details_submitted,
    default_currency = excluded.default_currency,
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.upsert_partner_billing_profile(
  p_partner_id uuid,
  p_provider text,
  p_external_customer_id text,
  p_default_payment_method_id text default null,
  p_billing_status text default 'active'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  insert into public.partner_billing_profiles (
    partner_id, provider, external_customer_id, default_payment_method_id, billing_status
  ) values (
    p_partner_id, p_provider, p_external_customer_id, p_default_payment_method_id, p_billing_status
  )
  on conflict (partner_id) do update set
    external_customer_id = excluded.external_customer_id,
    default_payment_method_id = coalesce(excluded.default_payment_method_id, partner_billing_profiles.default_payment_method_id),
    billing_status = excluded.billing_status,
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.generate_partner_commission_invoices(p_period_end timestamptz default now())
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner record;
  v_invoice_id uuid;
  v_count integer := 0;
  v_period_start timestamptz := date_trunc('month', p_period_end - interval '1 month');
  v_period_end timestamptz := date_trunc('month', p_period_end);
begin
  for v_partner in
    select cr.partner_id, sum(cr.commission_value) as total
    from public.commission_records cr
    where cr.status = 'approved'
      and cr.approved_at >= v_period_start
      and cr.approved_at < v_period_end
    group by cr.partner_id
    having sum(cr.commission_value) > 0
  loop
    insert into public.billing_invoices (
      partner_id, invoice_number, period_start, period_end,
      gross_commission, currency, status, idempotency_key
    ) values (
      v_partner.partner_id,
      'INV-' || to_char(v_period_start, 'YYYYMM') || '-' || substr(v_partner.partner_id::text, 1, 8),
      v_period_start,
      v_period_end,
      v_partner.total,
      'NZD',
      'open',
      'partner-invoice-' || v_partner.partner_id::text || '-' || to_char(v_period_start, 'YYYY-MM')
    )
    on conflict (idempotency_key) do nothing
    returning id into v_invoice_id;

    if v_invoice_id is not null then
      insert into public.billing_invoice_items (invoice_id, commission_id, amount)
      select v_invoice_id, cr.id, cr.commission_value
      from public.commission_records cr
      where cr.partner_id = v_partner.partner_id
        and cr.status = 'approved'
        and cr.approved_at >= v_period_start
        and cr.approved_at < v_period_end
      on conflict (commission_id) do nothing;

      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end;
$$;

create or replace function public.generate_affiliate_payout_batch(p_period_end timestamptz default now())
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_batch_id uuid;
  v_period_start timestamptz := date_trunc('month', p_period_end - interval '1 month');
  v_period_end timestamptz := date_trunc('month', p_period_end);
  v_idempotency text := 'payout-batch-' || to_char(v_period_start, 'YYYY-MM');
  v_total numeric;
begin
  insert into public.payout_batches (
    period_start, period_end, status, total_amount, currency, idempotency_key
  ) values (
    v_period_start, v_period_end, 'draft', 0, 'NZD', v_idempotency
  )
  on conflict (idempotency_key) do nothing
  returning id into v_batch_id;

  if v_batch_id is null then
    select id into v_batch_id from public.payout_batches where idempotency_key = v_idempotency;
    return v_batch_id;
  end if;

  insert into public.payout_items (
    batch_id, affiliate_id, commission_id, amount, currency, status, idempotency_key
  )
  select
    v_batch_id,
    cr.affiliate_id,
    cr.id,
    cr.commission_value,
    cr.currency,
    'pending',
    'payout-item-' || cr.id::text
  from public.commission_records cr
  join public.payout_accounts pa on pa.affiliate_id = cr.affiliate_id
  where cr.status = 'approved'
    and cr.approved_at >= v_period_start
    and cr.approved_at < v_period_end
    and pa.payouts_enabled = true
    and pa.onboarding_status = 'complete'
  on conflict (commission_id) do nothing;

  select coalesce(sum(amount), 0) into v_total
  from public.payout_items where batch_id = v_batch_id;

  update public.payout_batches
  set total_amount = v_total, updated_at = now()
  where id = v_batch_id;

  return v_batch_id;
end;
$$;

create or replace function public.mark_commission_paid(p_commission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.commission_records
  set status = 'paid', paid_at = now(), updated_at = now()
  where id = p_commission_id and status = 'approved';
end;
$$;

create or replace function public.mark_payout_item_status(
  p_payout_item_id uuid,
  p_status text,
  p_external_transfer_id text default null,
  p_external_payout_id text default null,
  p_failure_message text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_commission_id uuid;
begin
  update public.payout_items
  set
    status = p_status,
    external_transfer_id = coalesce(p_external_transfer_id, external_transfer_id),
    external_payout_id = coalesce(p_external_payout_id, external_payout_id),
    paid_at = case when p_status = 'paid' then now() else paid_at end,
    failed_at = case when p_status = 'failed' then now() else failed_at end,
    failure_message = p_failure_message,
    updated_at = now()
  where id = p_payout_item_id
  returning commission_id into v_commission_id;

  if p_status = 'paid' and v_commission_id is not null then
    perform public.mark_commission_paid(v_commission_id);
  end if;
end;
$$;

create or replace function public.mark_billing_invoice_status(
  p_invoice_id uuid,
  p_status text,
  p_external_payment_intent_id text default null,
  p_failure_message text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.billing_invoices
  set
    status = p_status,
    external_payment_intent_id = coalesce(p_external_payment_intent_id, external_payment_intent_id),
    paid_at = case when p_status = 'paid' then now() else paid_at end,
    failed_at = case when p_status = 'failed' then now() else failed_at end,
    failure_message = p_failure_message,
    updated_at = now()
  where id = p_invoice_id;
end;
$$;

grant execute on function public.upsert_payout_account(uuid, text, text, text, boolean, boolean, boolean, text) to service_role;
grant execute on function public.upsert_partner_billing_profile(uuid, text, text, text, text) to service_role;
grant execute on function public.generate_partner_commission_invoices(timestamptz) to service_role;
grant execute on function public.generate_affiliate_payout_batch(timestamptz) to service_role;
grant execute on function public.mark_commission_paid(uuid) to service_role;
grant execute on function public.mark_payout_item_status(uuid, text, text, text, text) to service_role;
grant execute on function public.mark_billing_invoice_status(uuid, text, text, text) to service_role;

alter table public.payout_accounts enable row level security;
alter table public.partner_billing_profiles enable row level security;
alter table public.billing_invoices enable row level security;
alter table public.payout_batches enable row level security;
alter table public.payout_items enable row level security;

drop policy if exists "Affiliates can read own payout account via rpc only" on public.payout_accounts;
create policy "Affiliates can read own payout account via rpc only"
  on public.payout_accounts for select
  using (
    exists (
      select 1 from public.affiliates a
      where a.id = payout_accounts.affiliate_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "Partners can read own billing profile" on public.partner_billing_profiles;
create policy "Partners can read own billing profile"
  on public.partner_billing_profiles for select
  using (
    exists (
      select 1 from public.partners p
      where p.id = partner_billing_profiles.partner_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Affiliates can read own payout items" on public.payout_items;
create policy "Affiliates can read own payout items"
  on public.payout_items for select
  using (
    exists (
      select 1 from public.affiliates a
      where a.id = payout_items.affiliate_id and a.user_id = auth.uid()
    )
  );

-- pg_cron examples (enable pg_cron extension in Supabase dashboard first):
-- select cron.schedule('approve-expired-commissions', '0 2 * * *', $$select public.approve_expired_commissions();$$);
-- select cron.schedule('generate-partner-invoices', '0 3 1 * *', $$select public.generate_partner_commission_invoices();$$);
-- select cron.schedule('generate-payout-batch', '0 4 1 * *', $$select public.generate_affiliate_payout_batch();$$);
