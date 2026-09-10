-- Shared family key so line-priced variants can be created independently
-- and later stay price-synced.

alter table public.foodvault_products
  add column if not exists product_family_id uuid;

create index if not exists foodvault_products_family_idx
  on public.foodvault_products (product_family_id);

notify pgrst, 'reload schema';
