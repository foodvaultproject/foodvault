-- Production already has quantity_remaining NOT NULL without a default.
-- Backfill and default so intake rows never insert NULL remaining.

alter table public.foodvault_inventory_batches
  add column if not exists quantity_remaining integer;

update public.foodvault_inventory_batches
  set quantity_remaining = quantity_received
  where quantity_remaining is null;

alter table public.foodvault_inventory_batches
  alter column quantity_remaining set default 0;

alter table public.foodvault_inventory_batches
  alter column quantity_remaining set not null;

notify pgrst, 'reload schema';
