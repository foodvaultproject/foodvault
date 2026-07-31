-- Expose Vault Drop clearance offers on public brand profiles.
-- Ensures partners.vault_drop exists (may not have been applied on prod yet).

alter table public.partners
  add column if not exists vault_drop jsonb;

comment on column public.partners.vault_drop is
  'Optional Vault Drop clearance offers (duration, countdown, products).';

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

notify pgrst, 'reload schema';
