-- Partner Brand Profile page: profile slug/youtube, secure discount-code access,
-- and a public profile view that never exposes the member discount code.

-- 0. Search support column maintained by trigger (a GENERATED tsvector column is
-- rejected as "not immutable" on some Postgres builds, so we use a trigger).
alter table public.partners
  add column if not exists search_keywords text,
  add column if not exists product_keywords text,
  add column if not exists featured_until timestamptz,
  add column if not exists featured_rank integer not null default 0,
  add column if not exists search_document tsvector;

create or replace function public.partners_search_document_refresh()
returns trigger
language plpgsql
as $$
begin
  new.search_document :=
    setweight(to_tsvector('english', coalesce(new.business_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.primary_category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.subcategories, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.search_keywords, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.short_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.product_keywords, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.brand_story, '')), 'D');
  return new;
end;
$$;

drop trigger if exists partners_search_document_update on public.partners;
create trigger partners_search_document_update
  before insert or update on public.partners
  for each row execute function public.partners_search_document_refresh();

update public.partners set updated_at = updated_at;

create index if not exists partners_search_document_idx on public.partners using gin (search_document);

-- 1. Profile columns
alter table public.partners
  add column if not exists youtube text,
  add column if not exists discount_percent numeric(5, 2),
  add column if not exists gallery_image_urls text[] default '{}';

-- Stable slug matching the frontend slugify (lowercase, non-alphanumerics -> '-')
alter table public.partners
  add column if not exists slug text
  generated always as (
    trim(both '-' from lower(regexp_replace(coalesce(business_name, ''), '[^a-zA-Z0-9]+', '-', 'g')))
  ) stored;

create index if not exists partners_slug_idx on public.partners (slug);

-- 2. Lock down the discount code at the COLUMN level.
-- RLS is row-level only, and a table-level SELECT grant covers ALL columns, so a
-- column-level REVOKE alone is ignored. We must drop the table-level grant and
-- re-grant SELECT on every column EXCEPT member_code. The code is then only
-- reachable via the security-definer RPC below.
revoke select on public.partners from anon, authenticated;
grant select (
  id, user_id, application_status_v2, listing_status_v2, business_name, website_url,
  created_at, updated_at, short_description, brand_story, primary_category, subcategories,
  offer_type, discount_value, offer_applies_to, offer_terms, support_email, support_phone,
  instagram, facebook, linkedin, tiktok, location, suspended, approved_at,
  banner_image_url, logo_url, search_keywords, product_keywords, discount_percent,
  gallery_image_urls, featured_until, featured_rank, search_document, youtube, slug
) on public.partners to anon, authenticated;

-- 3. Secure, role-aware discount-code accessor.
create or replace function public.get_partner_discount_code(p_partner_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_owner uuid;
  v_is_live boolean;
begin
  select member_code, user_id,
         (application_status_v2 = 'APPROVED'
          and listing_status_v2 = 'LIVE'
          and coalesce(suspended, false) = false)
    into v_code, v_owner, v_is_live
  from public.partners
  where id = p_partner_id;

  if v_code is null then return null; end if;
  if public.is_admin() then return v_code; end if;           -- admins: all codes
  if v_uid is null then return null; end if;                 -- anon: never
  if v_owner = v_uid then return v_code; end if;             -- partner: own only

  -- members / free-trial members: any live brand
  if v_is_live and exists (
    select 1 from public.members m
    where m.auth_user_id = v_uid
      and m.deleted_at is null
      and m.membership_status in ('trialing', 'active')
  ) then
    return v_code;
  end if;

  return null;                                               -- partner viewing others: hidden
end;
$$;

grant execute on function public.get_partner_discount_code(uuid) to anon, authenticated;

-- 4. Public profile view (RLS-enforced; excludes member_code + private contact info).
create or replace view public.v_public_brand_profile
with (security_invoker = true) as
select
  p.id, p.slug, p.business_name, p.short_description, p.brand_story,
  p.website_url, p.location,
  p.primary_category as department, p.subcategories,
  p.offer_type, p.discount_value, p.discount_percent, p.offer_applies_to, p.offer_terms,
  p.banner_image_url, p.logo_url, p.gallery_image_urls,
  p.instagram, p.facebook, p.tiktok, p.youtube,
  p.approved_at, p.updated_at,
  (p.featured_until is not null and p.featured_until > now()) as is_featured
from public.partners p
where p.application_status_v2 = 'APPROVED'
  and p.listing_status_v2 = 'LIVE'
  and coalesce(p.suspended, false) = false;

grant select on public.v_public_brand_profile to anon, authenticated;

-- 5. Admin-only accessors so admins keep full code visibility/search after the
-- column revoke. SECURITY DEFINER bypasses the column grant; is_admin() gate
-- means non-admins receive an empty set.
create or replace function public.admin_list_pending_applications()
returns table (
  id uuid, business_name text, website_url text, primary_category text,
  location text, created_at timestamptz, short_description text, brand_story text,
  discount_value text, offer_type text, offer_terms text, member_code text,
  support_email text, support_phone text
)
language sql
stable
security definer
set search_path = public
as $$
  select id, business_name, website_url, primary_category, location, created_at,
         short_description, brand_story, discount_value, offer_type, offer_terms,
         member_code, support_email, support_phone
  from public.partners
  where public.is_admin()
    and application_status_v2 = 'APPLICATION_UNDER_REVIEW'
  order by created_at desc;
$$;

create or replace function public.admin_list_partners(p_search text default null)
returns table (
  id uuid, business_name text, primary_category text, application_status_v2 text,
  listing_status_v2 text, suspended boolean, approved_at timestamptz,
  location text, member_code text
)
language sql
stable
security definer
set search_path = public
as $$
  select id, business_name, primary_category, application_status_v2,
         listing_status_v2, suspended, approved_at, location, member_code
  from public.partners
  where public.is_admin()
    and (
      p_search is null or p_search = ''
      or business_name ilike '%' || p_search || '%'
      or member_code ilike '%' || p_search || '%'
      or location ilike '%' || p_search || '%'
    )
  order by created_at desc;
$$;

grant execute on function public.admin_list_pending_applications() to authenticated;
grant execute on function public.admin_list_partners(text) to authenticated;
