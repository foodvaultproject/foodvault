-- Keep product stock, gallery, and category fields in schema cache.
-- Also backfill SOH from inventory intake so Vault Market can go live.

alter table public.foodvault_products
  add column if not exists stock_quantity integer not null default 0,
  add column if not exists gallery_urls text[],
  add column if not exists subcategory text,
  add column if not exists updated_at timestamptz default now();

update public.foodvault_products as product
set stock_quantity = coalesce(intake.qty, 0)
from (
  select product_id::text as product_id, sum(quantity_received)::integer as qty
  from public.foodvault_inventory_batches
  group by product_id::text
) as intake
where product.id::text = intake.product_id;

notify pgrst, 'reload schema';
