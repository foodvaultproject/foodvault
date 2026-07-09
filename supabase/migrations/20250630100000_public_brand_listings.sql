-- Public brand discovery: listings view, search RPC, and enum-safe visibility.
-- Fixes live partners not appearing on Browse Brands, Our Partners, or Homepage.

-- Columns the view/RPC expect (harmless if already present).
alter table public.partners
  add column if not exists featured_until timestamptz,
  add column if not exists featured_rank integer not null default 0,
  add column if not exists discount_percent numeric(5, 2),
  add column if not exists member_offer_confirmed boolean default false,
  add column if not exists business_status text default 'active',
  add column if not exists deleted_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'partners'
      and column_name = 'slug'
  ) then
    alter table public.partners
      add column slug text generated always as (
        trim(both '-' from lower(regexp_replace(coalesce(business_name, ''), '[^a-zA-Z0-9]+', '-', 'g')))
      ) stored;
  end if;
end $$;

-- Visibility columns (member_offer_confirmed, business_status, deleted_at) must be
-- readable by anon/authenticated or the public RLS policy always denies access.
revoke select on public.partners from anon, authenticated;

do $$
declare
  cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
    into cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'partners'
    and column_name <> 'member_code';

  if cols is not null then
    execute format(
      'grant select (%s) on public.partners to anon, authenticated',
      cols
    );
  end if;
end $$;

revoke select (member_code) on public.partners from anon, authenticated;

-- Shared visibility predicate for legacy + v2 status columns.
create or replace function public.partner_is_publicly_visible(p public.partners)
returns boolean
language sql
stable
as $$
  select upper(p.application_status_v2::text) = 'APPROVED'
     and upper(p.listing_status_v2::text) = 'LIVE'
     and coalesce(p.suspended, false) = false
     and coalesce(p.member_offer_confirmed, true) = true
     and p.deleted_at is null
     and (
       p.business_status is null
       or lower(p.business_status::text) = 'active'
     );
$$;

-- Replace legacy public-read policy (often used lowercase enum labels only).
drop policy if exists "Public read live partner listings" on public.partners;
drop policy if exists "partners_public_read" on public.partners;

create policy "Public read live partner listings"
  on public.partners for select
  to anon, authenticated
  using (public.partner_is_publicly_visible(partners));

-- Directory / homepage / carousel source.
drop view if exists public.v_public_brand_listings;
create view public.v_public_brand_listings
with (security_invoker = false) as
select
  p.id,
  p.slug,
  p.business_name,
  p.short_description,
  p.primary_category as department,
  p.subcategories,
  p.offer_type,
  p.discount_value,
  coalesce(
    p.discount_percent,
    nullif(regexp_replace(coalesce(p.discount_value, ''), '[^0-9.]', '', 'g'), '')::numeric(5, 2)
  )::numeric(5, 2) as discount_percent,
  p.banner_image_url,
  p.logo_url,
  p.location,
  p.approved_at,
  p.updated_at,
  (p.featured_until is not null and p.featured_until > now()) as is_featured,
  p.featured_rank
from public.partners p
where public.partner_is_publicly_visible(p);

grant select on public.v_public_brand_listings to anon, authenticated;

-- Profile page source (same visibility rules).
drop view if exists public.v_public_brand_profile;
create view public.v_public_brand_profile
with (security_invoker = false) as
select
  p.id,
  p.slug,
  p.business_name,
  p.short_description,
  p.brand_story,
  p.website_url,
  p.location,
  p.primary_category as department,
  p.subcategories,
  p.offer_type,
  p.discount_value,
  coalesce(
    p.discount_percent,
    nullif(regexp_replace(coalesce(p.discount_value, ''), '[^0-9.]', '', 'g'), '')::numeric(5, 2)
  )::numeric(5, 2) as discount_percent,
  p.offer_applies_to,
  p.offer_terms,
  p.banner_image_url,
  p.logo_url,
  p.gallery_image_urls,
  p.instagram,
  p.facebook,
  p.tiktok,
  p.youtube,
  p.approved_at,
  p.updated_at,
  (p.featured_until is not null and p.featured_until > now()) as is_featured
from public.partners p
where public.partner_is_publicly_visible(p);

grant select on public.v_public_brand_profile to anon, authenticated;

-- Browse Brands search + sort RPC.
create or replace function public.search_public_brands(
  p_search text default null,
  p_department text default null,
  p_subcategory text default null,
  p_min_discount numeric default null,
  p_sort text default 'featured',
  p_limit integer default 9,
  p_offset integer default 0
)
returns table (
  id uuid,
  business_name text,
  short_description text,
  department text,
  subcategories text[],
  offer_type text,
  discount_value text,
  discount_percent numeric(5, 2),
  banner_image_url text,
  logo_url text,
  location text,
  is_featured boolean,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
  with filtered as (
    select v.*
    from public.v_public_brand_listings v
    where (p_department is null or v.department = p_department)
      and (p_subcategory is null or p_subcategory = any(v.subcategories))
      and (
        p_min_discount is null
        or coalesce(v.discount_percent, 0) >= p_min_discount
      )
      and (
        p_search is null
        or trim(p_search) = ''
        or v.business_name ilike '%' || trim(p_search) || '%'
        or coalesce(v.short_description, '') ilike '%' || trim(p_search) || '%'
        or coalesce(v.department, '') ilike '%' || trim(p_search) || '%'
      )
  ),
  ranked as (
    select
      f.*,
      count(*) over () as total_count
    from filtered f
  )
  select
    r.id,
    r.business_name,
    r.short_description,
    r.department,
    r.subcategories,
    r.offer_type,
    r.discount_value,
    r.discount_percent,
    r.banner_image_url,
    r.logo_url,
    r.location,
    r.is_featured,
    r.total_count
  from ranked r
  order by
    case when p_sort = 'featured' then r.is_featured end desc,
    case when p_sort = 'featured' then r.featured_rank end desc nulls last,
    case when p_sort = 'highest-discount' then r.discount_percent end desc nulls last,
    case when p_sort = 'alphabetical' then r.business_name end asc nulls last,
    case when p_sort = 'newest' then r.approved_at end desc nulls last,
    case when p_sort = 'recently-updated' then r.updated_at end desc nulls last,
    r.business_name asc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
end;
$$;

grant execute on function public.search_public_brands(
  text, text, text, numeric, text, integer, integer
) to anon, authenticated;

-- Backfill live partners that confirmed before visibility rules were aligned.
update public.partners
set member_offer_confirmed = true
where upper(application_status_v2::text) = 'APPROVED'
  and upper(listing_status_v2::text) = 'LIVE'
  and coalesce(member_offer_confirmed, false) = false;

-- Ensure confirm sets legacy visibility flags.
create or replace function public.confirm_partner_offer_live(p_partner_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.partners%rowtype;
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  update public.partners
  set listing_status_v2 = 'LIVE',
      member_offer_confirmed = true,
      updated_at = now()
  where id = p_partner_id
    and user_id = v_uid
    and upper(application_status_v2::text) = 'APPROVED'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Partner record not found or not approved';
  end if;

  -- Legacy business_status column (enum or text) when present.
  begin
    execute $sql$
      update public.partners
      set business_status = 'active'
      where id = $1
        and business_status is distinct from 'active'
    $sql$ using v_row.id;
  exception
    when undefined_column then null;
    when invalid_text_representation then null;
    when datatype_mismatch then null;
  end;

  select * into v_row from public.partners where id = v_row.id;

  return json_build_object(
    'id', v_row.id,
    'user_id', v_row.user_id,
    'application_status_v2', v_row.application_status_v2::text,
    'listing_status_v2', v_row.listing_status_v2::text,
    'business_name', v_row.business_name,
    'website_url', v_row.website_url
  );
end;
$$;

grant execute on function public.confirm_partner_offer_live(uuid) to authenticated;

notify pgrst, 'reload schema';
