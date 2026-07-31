-- Optional Vault Drop clearance offer stored as JSON on partner listings.

alter table public.partners
  add column if not exists vault_drop jsonb;

comment on column public.partners.vault_drop is
  'Optional Vault Drop clearance offer (title, pricing, countdown, status).';

create index if not exists partners_vault_drop_active_idx
  on public.partners ((vault_drop->>'status'))
  where vault_drop is not null;
