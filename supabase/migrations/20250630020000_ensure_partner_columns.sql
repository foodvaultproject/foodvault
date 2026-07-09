-- Ensure every column the partner application / listing editor writes exists,
-- then force PostgREST to reload its schema cache (fixes
-- "Could not find the 'brand_story' column of 'partners' in the schema cache").

alter table public.partners
  add column if not exists member_code text,
  add column if not exists suspended boolean not null default false,
  add column if not exists approved_at timestamptz,
  add column if not exists short_description text,
  add column if not exists brand_story text,
  add column if not exists primary_category text,
  add column if not exists subcategories text[] default '{}',
  add column if not exists offer_type text,
  add column if not exists discount_value text,
  add column if not exists discount_percent numeric(5, 2),
  add column if not exists offer_applies_to text,
  add column if not exists offer_terms text,
  add column if not exists support_email text,
  add column if not exists support_phone text,
  add column if not exists instagram text,
  add column if not exists facebook text,
  add column if not exists linkedin text,
  add column if not exists tiktok text,
  add column if not exists youtube text,
  add column if not exists location text default 'New Zealand',
  add column if not exists banner_image_url text,
  add column if not exists logo_url text,
  add column if not exists gallery_image_urls text[] default '{}';

-- Reload the PostgREST schema cache so the API sees the columns immediately.
notify pgrst, 'reload schema';
