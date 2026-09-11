-- Extra media images were being dropped on save because this column
-- never existed on production foodvault_products.

alter table public.foodvault_products
  add column if not exists gallery_urls text[],
  add column if not exists subcategory text,
  add column if not exists unit_pricing jsonb,
  add column if not exists net_weight_g numeric(12, 2),
  add column if not exists natural_flavours_or_colours boolean,
  add column if not exists updated_at timestamptz default now();

notify pgrst, 'reload schema';
