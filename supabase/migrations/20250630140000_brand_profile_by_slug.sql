-- Reliable brand profile lookup by URL slug (bypasses view/RLS edge cases).

create or replace function public.get_public_brand_profile_by_slug(p_slug text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(v.*)::json
  from public.v_public_brand_profile v
  where lower(v.slug) = lower(trim(p_slug))
     or trim(both '-' from lower(regexp_replace(coalesce(v.business_name, ''), '[^a-zA-Z0-9]+', '-', 'g')))
        = lower(trim(p_slug))
  limit 1;
$$;

grant execute on function public.get_public_brand_profile_by_slug(text) to anon, authenticated;

-- Include slug in browse search results for accurate profile links.
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
    r.slug,
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

notify pgrst, 'reload schema';
