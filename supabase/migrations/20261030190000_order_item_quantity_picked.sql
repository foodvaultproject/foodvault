-- Picked quantity for manual-capture grocery orders.
-- Null means the line has not been resolved. 0 means out of stock.

alter table public.foodvault_order_items
  add column if not exists quantity_picked integer;

alter table public.foodvault_order_items
  drop constraint if exists foodvault_order_items_quantity_picked_nonnegative;

alter table public.foodvault_order_items
  add constraint foodvault_order_items_quantity_picked_nonnegative
  check (quantity_picked is null or quantity_picked >= 0);

notify pgrst, 'reload schema';
