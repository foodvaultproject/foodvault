-- Repair the partners table to its expected shape. This handles databases where
-- a `partners` table already existed before the base migration, so
-- `create table if not exists` skipped it and core columns (user_id, member_code,
-- etc.) were never added.

-- 1. Ensure every expected column exists.
alter table public.partners
  add column if not exists user_id uuid,
  add column if not exists member_code text,
  add column if not exists business_name text,
  add column if not exists website_url text,
  add column if not exists application_status_v2 text not null default 'APPLICATION_UNDER_REVIEW',
  add column if not exists listing_status_v2 text not null default 'PENDING',
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
  add column if not exists gallery_image_urls text[] default '{}',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- 2. Unique index on user_id (required for upsert onConflict: 'user_id').
create unique index if not exists partners_user_id_key on public.partners (user_id);

-- 3. Foreign key to auth.users (guarded so re-runs don't error).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'partners_user_id_fkey'
  ) then
    alter table public.partners
      add constraint partners_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;
end $$;

-- 4. Row level security + the policies the partner flows depend on.
alter table public.partners enable row level security;

drop policy if exists "Partners can read own record" on public.partners;
create policy "Partners can read own record"
  on public.partners for select
  using (auth.uid() = user_id);

drop policy if exists "Partners can insert own record" on public.partners;
create policy "Partners can insert own record"
  on public.partners for insert
  with check (auth.uid() = user_id);

drop policy if exists "Partners can update own listing status" on public.partners;
create policy "Partners can update own listing status"
  on public.partners for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Reload PostgREST schema cache so the API sees the columns immediately.
notify pgrst, 'reload schema';
