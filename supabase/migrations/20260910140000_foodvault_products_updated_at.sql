-- foodvault_products may predate later ALTERs. Inventory stock updates write updated_at.

alter table public.foodvault_products
  add column if not exists updated_at timestamptz not null default now();

notify pgrst, 'reload schema';
