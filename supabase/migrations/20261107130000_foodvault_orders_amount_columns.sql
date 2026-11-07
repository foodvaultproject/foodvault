-- The live orders table was created before these amount columns existed.
-- CREATE TABLE IF NOT EXISTS does not add them to that older table.

alter table public.foodvault_orders
  add column if not exists subtotal numeric(12, 2) not null default 0,
  add column if not exists total numeric(12, 2) not null default 0,
  add column if not exists currency text not null default 'NZD',
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists total_savings numeric(12, 2) not null default 0,
  add column if not exists shipping_name text,
  add column if not exists shipping_line1 text,
  add column if not exists shipping_line2 text,
  add column if not exists shipping_city text,
  add column if not exists shipping_state text,
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_country text,
  add column if not exists shipping_phone text,
  add column if not exists shipping_email text,
  add column if not exists delivery_notes text,
  add column if not exists shipping_cost numeric(10, 2),
  add column if not exists tracking_number text,
  add column if not exists fulfilled_at timestamptz,
  add column if not exists updated_at timestamptz default now();

alter table public.foodvault_orders
  add column if not exists member_id uuid,
  add column if not exists confirmation_sent_at timestamptz;

alter table public.foodvault_order_items
  add column if not exists name text,
  add column if not exists sku text,
  add column if not exists line_total numeric(12, 2);

notify pgrst, 'reload schema';
