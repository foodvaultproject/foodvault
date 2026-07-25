-- Support multi-select department, subcategory, and dietary filters in brand search.

drop function if exists public.search_public_brands(
  text, text, text, numeric, text, integer, integer
);

drop function if exists public.search_public_brands(
  text, text, text, text, numeric, text, integer, integer
);

create or replace function public.search_public_brands(
  p_search text default null,
  p_departments text[] default null,
  p_subcategories text[] default null,
  p_dietary_lifestyles text[] default null,
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
  dietary_lifestyle_attributes text[],
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
        p_departments is null
        or cardinality(p_departments) = 0
        or v.department = any(p_departments)
        or coalesce(v.primary_categories, '{}'::text[]) && p_departments
      )
      and (
        p_subcategories is null
        or cardinality(p_subcategories) = 0
        or coalesce(v.subcategories, '{}'::text[]) && p_subcategories
      )
      and (
        p_dietary_lifestyles is null
        or cardinality(p_dietary_lifestyles) = 0
        or coalesce(v.dietary_lifestyle_attributes, '{}'::text[]) && p_dietary_lifestyles
        or exists (
          select 1
          from jsonb_array_elements(coalesce(v.category_groups, '[]'::jsonb)) as group_row(value)
          cross join unnest(p_dietary_lifestyles) as lifestyle(value)
          where coalesce(group_row.value->'dietaryLifestyleAttributes', '[]'::jsonb)
            ? lifestyle.value
        )
      )
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
    r.dietary_lifestyle_attributes,
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
  text, text[], text[], text[], numeric, text, integer, integer
) to anon, authenticated;

notify pgrst, 'reload schema';
