alter table public.foodvault_products
  add column if not exists is_multibuy boolean not null default false,
  add column if not exists multibuy_quantity integer,
  add column if not exists multibuy_price numeric(12, 2);

notify pgrst, 'reload schema';
