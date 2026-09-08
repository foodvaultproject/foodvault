-- Email / member alerts for Vault Market launch.

create table if not exists public.foodvault_vault_market_launch_alerts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  member_id uuid,
  source text not null default 'homepage_banner',
  created_at timestamptz not null default now()
);

create unique index if not exists foodvault_vault_market_launch_alerts_email_idx
  on public.foodvault_vault_market_launch_alerts (lower(email));

create index if not exists foodvault_vault_market_launch_alerts_created_idx
  on public.foodvault_vault_market_launch_alerts (created_at desc);

alter table public.foodvault_vault_market_launch_alerts enable row level security;
