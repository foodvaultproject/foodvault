-- Brand profile recommendations: scored matches from public listings only.
-- Refreshes v_public_brand_listings first so logo_crop exists (older DBs may lack it).

alter table public.partners
  add column if not exists logo_crop jsonb;

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
  p.logo_crop,
  p.location,
  p.approved_at,
  p.updated_at,
  (p.featured_until is not null and p.featured_until > now()) as is_featured,
  p.featured_rank
from public.partners p
where public.partner_is_publicly_visible(p);

grant select on public.v_public_brand_listings to anon, authenticated;

create index if not exists idx_partners_primary_category
  on public.partners (primary_category);

create index if not exists idx_partners_subcategories_gin
  on public.partners using gin (subcategories);

create or replace function public.get_recommended_brands(
  p_partner_id uuid,
  p_limit integer default 4
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
  logo_crop jsonb,
  location text,
  is_featured boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with source as (
    select
      coalesce(p.primary_category, '') as department,
      coalesce(p.subcategories, '{}'::text[]) as subcategories,
      lower(coalesce(p.offer_type, '')) as offer_type,
      coalesce(p.discount_percent, 0)::numeric(5, 2) as discount_percent
    from public.partners p
    where p.id = p_partner_id
  ),
  scored as (
    select
      v.id,
      v.slug,
      v.business_name,
      v.short_description,
      v.department,
      v.subcategories,
      v.offer_type,
      v.discount_value,
      v.discount_percent,
      v.banner_image_url,
      v.logo_url,
      v.logo_crop,
      v.location,
      v.is_featured,
      v.featured_rank,
      (
        case when v.department is not null and v.department = s.department then 100 else 0 end
        + case
            when coalesce(array_length(s.subcategories, 1), 0) > 0
             and v.subcategories && s.subcategories
            then 20 * (
              select count(*)::integer
              from unnest(v.subcategories) as cat
              where cat = any (s.subcategories)
            )
            else 0
          end
        + case when lower(coalesce(v.offer_type, '')) = s.offer_type then 10 else 0 end
        + case
            when abs(coalesce(v.discount_percent, 0) - s.discount_percent) <= 5 then 5
            else 0
          end
        + case when v.is_featured then 5 else 0 end
      ) as match_score
    from public.v_public_brand_listings v
    cross join source s
    where v.id <> p_partner_id
  )
  select
    s.id,
    s.slug,
    s.business_name,
    s.short_description,
    s.department,
    s.subcategories,
    s.offer_type,
    s.discount_value,
    s.discount_percent,
    s.banner_image_url,
    s.logo_url,
    s.logo_crop,
    s.location,
    s.is_featured
  from scored s
  order by
    s.match_score desc,
    s.is_featured desc,
    s.featured_rank desc nulls last,
    random()
  limit greatest(coalesce(p_limit, 4), 1);
$$;

grant execute on function public.get_recommended_brands(uuid, integer) to anon, authenticated;

notify pgrst, 'reload schema';
