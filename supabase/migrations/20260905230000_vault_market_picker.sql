-- Warehouse picker fields. Additive if already applied remotely.

alter table public.foodvault_products
  add column if not exists bin_location text;

alter table public.foodvault_orders
  add column if not exists tracking_number text,
  add column if not exists fulfilled_at timestamptz,
  add column if not exists updated_at timestamptz default now();
