-- Selected Products offer: structured scope + product list for member offers.
-- Ensures all partner media / offer columns exist before recreating submit RPC.

alter table public.partners
  add column if not exists banner_original_url text,
  add column if not exists banner_crop jsonb,
  add column if not exists logo_original_url text,
  add column if not exists logo_crop jsonb,
  add column if not exists gallery_original_urls text[] default '{}',
  add column if not exists gallery_image_crops jsonb default '[]',
  add column if not exists offer_scope text,
  add column if not exists selected_products jsonb not null default '[]'::jsonb;

comment on column public.partners.banner_original_url is
  'Full-resolution banner upload before 3:1 crop.';
comment on column public.partners.banner_crop is
  'Banner crop editor state: { "zoom", "x", "y", "areaPercent" }.';
comment on column public.partners.logo_original_url is
  'Full-resolution logo upload before circular crop.';
comment on column public.partners.logo_crop is
  'Logo crop editor state: { "zoom", "x", "y", "areaPercent" }.';
comment on column public.partners.gallery_original_urls is
  'Original gallery uploads before crop.';
comment on column public.partners.gallery_image_crops is
  'Per-gallery-image crop metadata array.';
comment on column public.partners.offer_scope is
  'entire_store | selected_products';
comment on column public.partners.selected_products is
  'Ordered JSON array of selected product offers shown on the brand profile.';

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

-- Extend submit_partner_application with offer scope + selected products.
do $$
declare
  fn record;
begin
  for fn in
    select pg_catalog.pg_get_function_identity_arguments(p.oid) as args
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'submit_partner_application'
  loop
    execute format(
      'drop function if exists public.submit_partner_application(%s)',
      fn.args
    );
  end loop;
end $$;

create or replace function public.submit_partner_application(
  p_business_name text,
  p_website_url text,
  p_short_description text,
  p_brand_story text,
  p_primary_category text,
  p_subcategories text[],
  p_offer_type text,
  p_discount_value text,
  p_offer_applies_to text,
  p_offer_terms text,
  p_support_email text,
  p_support_phone text,
  p_instagram text,
  p_facebook text,
  p_linkedin text,
  p_tiktok text,
  p_member_code text,
  p_banner_image_url text default null,
  p_logo_url text default null,
  p_gallery_image_urls text[] default '{}',
  p_logo_original_url text default null,
  p_logo_crop jsonb default null,
  p_gallery_original_urls text[] default '{}',
  p_gallery_image_crops jsonb default '[]',
  p_banner_original_url text default null,
  p_banner_crop jsonb default null,
  p_offer_scope text default 'entire_store',
  p_selected_products jsonb default '[]'::jsonb,
  p_discount_percent numeric default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.partners%rowtype;
  v_description text := coalesce(
    nullif(trim(p_short_description), ''),
    nullif(trim(p_brand_story), ''),
    nullif(trim(p_business_name), ''),
    'Partner application'
  );
  v_offer_summary text := public.build_partner_offer_summary(
    p_discount_value,
    p_offer_type,
    p_offer_applies_to,
    p_offer_terms
  );
  v_scope text := coalesce(nullif(trim(p_offer_scope), ''), 'entire_store');
  v_discount_percent numeric(5, 2) := p_discount_percent;
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  if v_scope = 'entire_store' and v_discount_percent is null then
    v_discount_percent := nullif(
      regexp_replace(coalesce(p_discount_value, ''), '[^0-9.]', '', 'g'),
      ''
    )::numeric(5, 2);
  end if;

  insert into public.partners (
    user_id,
    auth_user_id,
    description,
    offer_summary,
    member_offer_confirmed,
    application_status_v2,
    listing_status_v2,
    member_code,
    business_name,
    website_url,
    short_description,
    brand_story,
    primary_category,
    subcategories,
    offer_type,
    discount_value,
    discount_percent,
    offer_applies_to,
    offer_terms,
    offer_scope,
    selected_products,
    support_email,
    support_phone,
    instagram,
    facebook,
    linkedin,
    tiktok,
    banner_image_url,
    banner_original_url,
    banner_crop,
    logo_url,
    logo_original_url,
    logo_crop,
    gallery_image_urls,
    gallery_original_urls,
    gallery_image_crops,
    location,
    updated_at
  ) values (
    v_uid,
    v_uid,
    v_description,
    v_offer_summary,
    false,
    'APPLICATION_UNDER_REVIEW',
    'PENDING',
    p_member_code,
    p_business_name,
    p_website_url,
    p_short_description,
    p_brand_story,
    p_primary_category,
    coalesce(p_subcategories, '{}'),
    p_offer_type,
    p_discount_value,
    v_discount_percent,
    p_offer_applies_to,
    p_offer_terms,
    v_scope,
    coalesce(p_selected_products, '[]'::jsonb),
    p_support_email,
    p_support_phone,
    p_instagram,
    p_facebook,
    p_linkedin,
    p_tiktok,
    p_banner_image_url,
    p_banner_original_url,
    p_banner_crop,
    p_logo_url,
    p_logo_original_url,
    p_logo_crop,
    coalesce(p_gallery_image_urls, '{}'),
    coalesce(p_gallery_original_urls, '{}'),
    coalesce(p_gallery_image_crops, '[]'::jsonb),
    'New Zealand',
    now()
  )
  on conflict (user_id) do update set
    auth_user_id = excluded.auth_user_id,
    description = excluded.description,
    offer_summary = excluded.offer_summary,
    member_offer_confirmed = false,
    application_status_v2 = 'APPLICATION_UNDER_REVIEW',
    listing_status_v2 = 'PENDING',
    member_code = excluded.member_code,
    business_name = excluded.business_name,
    website_url = excluded.website_url,
    short_description = excluded.short_description,
    brand_story = excluded.brand_story,
    primary_category = excluded.primary_category,
    subcategories = excluded.subcategories,
    offer_type = excluded.offer_type,
    discount_value = excluded.discount_value,
    discount_percent = excluded.discount_percent,
    offer_applies_to = excluded.offer_applies_to,
    offer_terms = excluded.offer_terms,
    offer_scope = excluded.offer_scope,
    selected_products = excluded.selected_products,
    support_email = excluded.support_email,
    support_phone = excluded.support_phone,
    instagram = excluded.instagram,
    facebook = excluded.facebook,
    linkedin = excluded.linkedin,
    tiktok = excluded.tiktok,
    banner_image_url = coalesce(excluded.banner_image_url, partners.banner_image_url),
    banner_original_url = coalesce(excluded.banner_original_url, partners.banner_original_url),
    banner_crop = coalesce(excluded.banner_crop, partners.banner_crop),
    logo_url = coalesce(excluded.logo_url, partners.logo_url),
    logo_original_url = coalesce(excluded.logo_original_url, partners.logo_original_url),
    logo_crop = coalesce(excluded.logo_crop, partners.logo_crop),
    gallery_image_urls = case
      when coalesce(array_length(excluded.gallery_image_urls, 1), 0) > 0
      then excluded.gallery_image_urls
      else partners.gallery_image_urls
    end,
    gallery_original_urls = case
      when coalesce(array_length(excluded.gallery_original_urls, 1), 0) > 0
      then excluded.gallery_original_urls
      else partners.gallery_original_urls
    end,
    gallery_image_crops = case
      when jsonb_array_length(coalesce(excluded.gallery_image_crops, '[]'::jsonb)) > 0
      then excluded.gallery_image_crops
      else partners.gallery_image_crops
    end,
    location = 'New Zealand',
    updated_at = now()
  returning * into v_row;

  return to_jsonb(v_row)::json;
end;
$$;

grant execute on function public.submit_partner_application(
  text, text, text, text, text, text[], text, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, jsonb, text[], jsonb, text, jsonb, text, jsonb, numeric
) to authenticated;

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
  p.offer_scope,
  p.selected_products,
  p.banner_image_url,
  p.logo_url,
  p.logo_original_url,
  p.logo_crop,
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

notify pgrst, 'reload schema';
