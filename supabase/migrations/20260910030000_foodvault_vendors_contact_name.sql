-- foodvault_vendors may already exist from an earlier create-table-if-not-exists
-- without later columns. Additive so vendor create/update matches the app payload.

alter table public.foodvault_vendors
  add column if not exists contact_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists payment_terms text,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

notify pgrst, 'reload schema';
