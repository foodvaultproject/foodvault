-- Multi-department partner categories: structured groups + browse/profile support.

alter table public.partners
  add column if not exists category_groups jsonb not null default '[]'::jsonb,
  add column if not exists primary_categories text[] not null default '{}';

comment on column public.partners.category_groups is
  'Ordered JSON array of { department, subcategories } category selections.';
comment on column public.partners.primary_categories is
  'All selected primary departments for browse tiles and filtering.';

update public.partners
set category_groups = jsonb_build_array(
      jsonb_build_object(
        'department', primary_category,
        'subcategories', coalesce(subcategories, '{}'::text[])
      )
    ),
    primary_categories = array[primary_category]
where primary_category is not null
  and (category_groups = '[]'::jsonb or category_groups is null);

drop view if exists public.v_public_brand_listings;
drop view if exists public.v_public_brand_profile;

create view public.v_public_brand_listings
with (security_invoker = false) as
select
  p.id,
  p.slug,
  p.business_name,
  p.short_description,
  p.primary_category as department,
  p.primary_categories,
  p.category_groups,
  p.subcategories,
  p.offer_type,
  p.discount_value,
  coalesce(
    p.discount_percent,
    nullif(regexp_replace(coalesce(p.discount_value, ''), '[^0-9.]', '', 'g'), '')::numeric(5, 2)
  )::numeric(5, 2) as discount_percent,
  p.banner_image_url,
  p.logo_url,
  p.logo_original_url,
  p.logo_crop,
  p.location,
  p.approved_at,
  p.updated_at,
  (p.featured_until is not null and p.featured_until > now()) as is_featured,
  p.featured_rank
from public.partners p
where public.partner_is_publicly_visible(p);

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
  p.primary_categories,
  p.category_groups,
  p.subcategories,
  p.offer_type,
  p.discount_value,
  coalesce(
    p.discount_percent,
    nullif(regexp_replace(coalesce(p.discount_value, ''), '[^0-9.]', '', 'g'), '')::numeric(5, 2)
  )::numeric(5, 2) as discount_percent,
  p.offer_applies_to,
  p.offer_terms,
  p.offer_scope,
  p.selected_products,
  p.banner_image_url,
  p.logo_url,
  p.logo_original_url,
  p.logo_crop,
  p.gallery_image_urls,
  p.instagram,
  p.facebook,
  p.linkedin,
  p.tiktok,
  p.youtube,
  p.approved_at,
  p.updated_at,
  (p.featured_until is not null and p.featured_until > now()) as is_featured
from public.partners p
where public.partner_is_publicly_visible(p);

grant select on public.v_public_brand_listings to anon, authenticated;
grant select on public.v_public_brand_profile to anon, authenticated;

drop function if exists public.search_public_brands(
  text, text, text, numeric, text, integer, integer
);

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
  slug text,
  business_name text,
  short_description text,
  department text,
  primary_categories text[],
  category_groups jsonb,
  subcategories text[],
  offer_type text,
  discount_value text,
  discount_percent numeric(5, 2),
  banner_image_url text,
  logo_url text,
  logo_original_url text,
  logo_crop jsonb,
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
    where (
        p_department is null
        or v.department = p_department
        or p_department = any(v.primary_categories)
      )
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
        or exists (
          select 1
          from unnest(coalesce(v.primary_categories, '{}'::text[])) as dept(value)
          where dept.value ilike '%' || trim(p_search) || '%'
        )
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
    r.slug,
    r.business_name,
    r.short_description,
    r.department,
    r.primary_categories,
    r.category_groups,
    r.subcategories,
    r.offer_type,
    r.discount_value,
    r.discount_percent,
    r.banner_image_url,
    r.logo_url,
    r.logo_original_url,
    r.logo_crop,
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

notify pgrst, 'reload schema';
