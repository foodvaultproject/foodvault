-- Include uploaded brand assets in the admin application review payload.
drop function if exists public.admin_list_pending_applications();

create function public.admin_list_pending_applications()
returns table (
  id uuid,
  business_name text,
  website_url text,
  primary_category text,
  location text,
  created_at timestamptz,
  short_description text,
  brand_story text,
  discount_value text,
  offer_type text,
  offer_terms text,
  member_code text,
  support_email text,
  support_phone text,
  banner_image_url text,
  logo_url text,
  gallery_image_urls text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    id,
    business_name,
    website_url,
    primary_category,
    location,
    created_at,
    short_description,
    brand_story,
    discount_value,
    offer_type,
    offer_terms,
    member_code,
    support_email,
    support_phone,
    banner_image_url,
    logo_url,
    gallery_image_urls
  from public.partners
  where public.is_admin()
    and application_status_v2 = 'APPLICATION_UNDER_REVIEW'
  order by created_at desc;
$$;

grant execute on function public.admin_list_pending_applications() to authenticated;
