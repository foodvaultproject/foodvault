-- Persist Vault Market delivery contact, notes, and freight on orders.

alter table public.foodvault_orders
  add column if not exists shipping_phone text,
  add column if not exists shipping_email text,
  add column if not exists delivery_notes text,
  add column if not exists shipping_cost numeric(10, 2);

notify pgrst, 'reload schema';
