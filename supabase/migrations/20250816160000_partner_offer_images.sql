-- Keep hospitality member-offer photos separate from the venue gallery.

alter table public.partners
  add column if not exists offer_image_urls text[] not null default '{}',
  add column if not exists offer_original_urls text[] not null default '{}',
  add column if not exists offer_image_crops jsonb not null default '[]'::jsonb;

comment on column public.partners.offer_image_urls is
  'Hospitality member-offer photos shown in the What''s on offer profile section.';
comment on column public.partners.offer_original_urls is
  'Original uploads for hospitality offer photos.';
comment on column public.partners.offer_image_crops is
  'Crop settings for hospitality offer photos.';

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
  p.suburb,
  p.city,
  p.region,
  p.latitude,
  p.longitude,
  p.listing_model,
  p.venue_type,
  p.opening_hours,
  p.support_phone,
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
  p.offer_exclusions,
  p.offer_scope,
  p.selected_products,
  p.banner_image_url,
  p.logo_url,
  p.logo_original_url,
  p.logo_crop,
  p.gallery_image_urls,
  p.offer_image_urls,
  p.vault_drop,
  p.instagram,
  p.facebook,
  p.linkedin,
  p.tiktok,
  p.youtube,
  p.affiliate_enabled,
  p.affiliate_commission_percent,
  p.affiliate_cookie_duration_days,
  p.affiliate_program_description,
  p.affiliate_terms,
  p.approved_at,
  p.updated_at,
  (p.featured_until is not null and p.featured_until > now()) as is_featured
from public.partners p
where public.partner_is_publicly_visible(p);

grant select on public.v_public_brand_profile to anon, authenticated;

grant insert, update, delete on public.partners to authenticated;

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

notify pgrst, 'reload schema';
