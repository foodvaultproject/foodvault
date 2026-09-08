-- WMS: product barcodes, vendors, purchase orders, and credit notes.
-- Additive and idempotent so it is safe if already applied remotely.

alter table public.foodvault_products
  add column if not exists barcode text,
  add column if not exists vendor_id uuid,
  add column if not exists wholesale_cost numeric(12, 2) not null default 0;

create unique index if not exists foodvault_products_barcode_uidx
  on public.foodvault_products (barcode)
  where barcode is not null and length(btrim(barcode)) > 0;

update public.foodvault_products
set barcode = sku
where barcode is null
  and sku is not null
  and length(btrim(sku)) > 0;

create table if not exists public.foodvault_vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  payment_terms text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'foodvault_products_vendor_id_fkey'
  ) then
    alter table public.foodvault_products
      add constraint foodvault_products_vendor_id_fkey
      foreign key (vendor_id) references public.foodvault_vendors(id) on delete set null;
  end if;
end $$;

create index if not exists foodvault_products_vendor_idx
  on public.foodvault_products (vendor_id);

create sequence if not exists public.foodvault_po_number_seq start with 1001;
create sequence if not exists public.foodvault_credit_number_seq start with 1001;

create table if not exists public.foodvault_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique,
  vendor_id uuid not null references public.foodvault_vendors(id) on delete restrict,
  status text not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists foodvault_purchase_orders_vendor_idx
  on public.foodvault_purchase_orders (vendor_id);

create index if not exists foodvault_purchase_orders_status_idx
  on public.foodvault_purchase_orders (status);

create table if not exists public.foodvault_po_items (
  id uuid primary key default gen_random_uuid(),
  po_id uuid not null references public.foodvault_purchase_orders(id) on delete cascade,
  product_id text not null,
  sku text,
  name text not null,
  barcode text,
  quantity_ordered integer not null default 0,
  quantity_received integer not null default 0,
  cost_price numeric(12, 2) not null default 0,
  discrepancy_qty integer not null default 0,
  discrepancy_reason text,
  batch_number text,
  expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists foodvault_po_items_po_idx
  on public.foodvault_po_items (po_id);

create table if not exists public.foodvault_credit_notes (
  id uuid primary key default gen_random_uuid(),
  credit_number text not null unique,
  po_id uuid references public.foodvault_purchase_orders(id) on delete set null,
  vendor_id uuid not null references public.foodvault_vendors(id) on delete restrict,
  status text not null default 'draft',
  total_claim numeric(12, 2) not null default 0,
  reason_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists foodvault_credit_notes_vendor_idx
  on public.foodvault_credit_notes (vendor_id);

create table if not exists public.foodvault_credit_note_items (
  id uuid primary key default gen_random_uuid(),
  credit_note_id uuid not null references public.foodvault_credit_notes(id) on delete cascade,
  po_item_id uuid,
  product_id text,
  sku text,
  name text,
  discrepancy_qty integer not null default 0,
  cost_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists foodvault_credit_note_items_note_idx
  on public.foodvault_credit_note_items (credit_note_id);

alter table public.foodvault_vendors enable row level security;
alter table public.foodvault_purchase_orders enable row level security;
alter table public.foodvault_po_items enable row level security;
alter table public.foodvault_credit_notes enable row level security;
alter table public.foodvault_credit_note_items enable row level security;
