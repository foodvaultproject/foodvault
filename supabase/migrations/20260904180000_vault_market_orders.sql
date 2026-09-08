-- Vault Market order fulfillment columns.
-- Tables may already exist from the applied commerce migration; this is additive.

create table if not exists public.foodvault_orders (
  id uuid primary key default gen_random_uuid(),
  member_id uuid,
  status text not null default 'paid',
  subtotal numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  currency text not null default 'NZD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.foodvault_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.foodvault_orders(id) on delete cascade,
  product_id text,
  sku text,
  name text not null,
  quantity integer not null default 1,
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.foodvault_orders
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists total_savings numeric(12, 2) not null default 0,
  add column if not exists shipping_name text,
  add column if not exists shipping_line1 text,
  add column if not exists shipping_line2 text,
  add column if not exists shipping_city text,
  add column if not exists shipping_state text,
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_country text;

create unique index if not exists foodvault_orders_stripe_session_uidx
  on public.foodvault_orders (stripe_session_id)
  where stripe_session_id is not null;

alter table public.foodvault_orders enable row level security;
alter table public.foodvault_order_items enable row level security;
