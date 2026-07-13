-- Internal contact name for partner application and listing forms.
alter table public.partners
  add column if not exists contact_name text;

comment on column public.partners.contact_name is
  'Internal contact name for FoodVault team use only; not shown on public profile.';
