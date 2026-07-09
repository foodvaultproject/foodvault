-- Repair: submit_partner_application references media columns that may be missing
-- if earlier crop migrations were never applied remotely.

alter table public.partners
  add column if not exists banner_original_url text,
  add column if not exists banner_crop jsonb,
  add column if not exists logo_original_url text,
  add column if not exists logo_crop jsonb,
  add column if not exists gallery_original_urls text[] default '{}',
  add column if not exists gallery_image_crops jsonb default '[]',
  add column if not exists offer_scope text,
  add column if not exists selected_products jsonb not null default '[]'::jsonb;

alter table public.partners
  alter column gallery_original_urls set default '{}',
  alter column gallery_image_crops set default '[]',
  alter column selected_products set default '[]'::jsonb;

update public.partners
set offer_scope = case
  when offer_applies_to = 'Selected Products' then 'selected_products'
  else 'entire_store'
end
where offer_scope is null;

update public.partners
set offer_scope = 'entire_store'
where offer_scope is null;

notify pgrst, 'reload schema';
