-- Demand events for out-of-stock Vault Market products (lost sales).

create table if not exists public.foodvault_lost_sales (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  sku text,
  name text,
  source text not null default 'view',
  search_query text,
  estimated_revenue numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists foodvault_lost_sales_product_idx
  on public.foodvault_lost_sales (product_id);

create index if not exists foodvault_lost_sales_created_idx
  on public.foodvault_lost_sales (created_at desc);

alter table public.foodvault_lost_sales enable row level security;
