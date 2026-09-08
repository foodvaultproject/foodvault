-- Vault Market PDP attributes + inventory batches.
-- Additive and idempotent so it is safe if already applied remotely.

create table if not exists public.foodvault_products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  brand text not null default 'FoodVault',
  retail_price numeric(12, 2) not null default 0,
  member_price numeric(12, 2) not null default 0,
  stock_quantity integer not null default 0,
  category text not null default 'Pantry',
  image_url text,
  is_active boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.foodvault_products add column if not exists subcategory text;
alter table public.foodvault_products add column if not exists slug text;
alter table public.foodvault_products add column if not exists gallery_urls text[];
alter table public.foodvault_products add column if not exists ingredients text;
alter table public.foodvault_products add column if not exists allergens text;
alter table public.foodvault_products add column if not exists nutrition_facts jsonb;
alter table public.foodvault_products add column if not exists origin_label text;
alter table public.foodvault_products add column if not exists unit_pricing jsonb;
alter table public.foodvault_products add column if not exists unit_price_label text;
alter table public.foodvault_products add column if not exists net_weight_g numeric(12, 2);
alter table public.foodvault_products add column if not exists health_star_rating numeric(3, 1);
alter table public.foodvault_products add column if not exists natural_flavours_or_colours boolean not null default false;
alter table public.foodvault_products add column if not exists description text;
alter table public.foodvault_products add column if not exists is_active boolean not null default true;
alter table public.foodvault_products add column if not exists updated_at timestamptz not null default now();

create table if not exists public.foodvault_inventory_batches (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  quantity_received integer not null default 0,
  unit_cost_price numeric(12, 2) not null default 0,
  batch_number text not null,
  expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists foodvault_inventory_batches_product_idx
  on public.foodvault_inventory_batches (product_id);

create index if not exists foodvault_inventory_batches_expiry_idx
  on public.foodvault_inventory_batches (expiry_date);

alter table public.foodvault_products enable row level security;
alter table public.foodvault_inventory_batches enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'foodvault_products'
      and policyname = 'foodvault_products_public_read'
  ) then
    create policy foodvault_products_public_read
      on public.foodvault_products
      for select
      using (coalesce(is_active, true));
  end if;
end $$;
