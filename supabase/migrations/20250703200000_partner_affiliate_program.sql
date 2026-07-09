-- Partner affiliate program configuration (Phase 1: partner-side setup only).

alter table public.partners
  add column if not exists affiliate_enabled boolean not null default false,
  add column if not exists affiliate_commission_percent smallint,
  add column if not exists affiliate_cookie_duration_days smallint,
  add column if not exists affiliate_program_description text,
  add column if not exists affiliate_terms text,
  add column if not exists affiliate_created_at timestamptz,
  add column if not exists affiliate_updated_at timestamptz;

comment on column public.partners.affiliate_enabled is
  'Whether the brand affiliate program is active.';
comment on column public.partners.affiliate_commission_percent is
  'Whole-number commission percentage paid to affiliates (1-50 when enabled).';
comment on column public.partners.affiliate_cookie_duration_days is
  'Referral attribution window in days (7, 14, 30, 60, or 90 when enabled).';
comment on column public.partners.affiliate_program_description is
  'Public affiliate program description shown on the brand profile.';
comment on column public.partners.affiliate_terms is
  'Optional affiliate program terms shown on the brand profile.';
comment on column public.partners.affiliate_created_at is
  'Timestamp when the affiliate program was first enabled.';
comment on column public.partners.affiliate_updated_at is
  'Timestamp when affiliate program settings were last changed.';

alter table public.partners
  drop constraint if exists partners_affiliate_commission_check;

alter table public.partners
  add constraint partners_affiliate_commission_check
  check (
    affiliate_commission_percent is null
    or (affiliate_commission_percent >= 1 and affiliate_commission_percent <= 50)
  );

alter table public.partners
  drop constraint if exists partners_affiliate_cookie_duration_check;

alter table public.partners
  add constraint partners_affiliate_cookie_duration_check
  check (
    affiliate_cookie_duration_days is null
    or affiliate_cookie_duration_days in (7, 14, 30, 60, 90)
  );

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

do $$
declare
  fn record;
begin
  for fn in
    select pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
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
  p_discount_percent numeric default null,
  p_affiliate_enabled boolean default false,
  p_affiliate_commission_percent smallint default null,
  p_affiliate_cookie_duration_days smallint default null,
  p_affiliate_program_description text default null,
  p_affiliate_terms text default null
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
  v_affiliate_enabled boolean := coalesce(p_affiliate_enabled, false);
  v_affiliate_description text := nullif(trim(p_affiliate_program_description), '');
  v_affiliate_terms text := nullif(trim(p_affiliate_terms), '');
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
    affiliate_enabled,
    affiliate_commission_percent,
    affiliate_cookie_duration_days,
    affiliate_program_description,
    affiliate_terms,
    affiliate_created_at,
    affiliate_updated_at,
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
    v_affiliate_enabled,
    case when v_affiliate_enabled then p_affiliate_commission_percent else null end,
    case when v_affiliate_enabled then p_affiliate_cookie_duration_days else null end,
    v_affiliate_description,
    v_affiliate_terms,
    case when v_affiliate_enabled then now() else null end,
    case when v_affiliate_enabled then now() else null end,
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
    affiliate_enabled = excluded.affiliate_enabled,
    affiliate_commission_percent = excluded.affiliate_commission_percent,
    affiliate_cookie_duration_days = excluded.affiliate_cookie_duration_days,
    affiliate_program_description = excluded.affiliate_program_description,
    affiliate_terms = excluded.affiliate_terms,
    affiliate_created_at = case
      when excluded.affiliate_enabled and partners.affiliate_created_at is null then now()
      when excluded.affiliate_enabled then partners.affiliate_created_at
      else partners.affiliate_created_at
    end,
    affiliate_updated_at = case
      when excluded.affiliate_enabled
        or partners.affiliate_enabled
        or excluded.affiliate_enabled is distinct from partners.affiliate_enabled
      then now()
      else partners.affiliate_updated_at
    end,
    location = 'New Zealand',
    updated_at = now()
  returning * into v_row;

  return to_jsonb(v_row)::json;
end;
$$;

grant execute on function public.submit_partner_application(
  text, text, text, text, text, text[], text, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, jsonb, text[], jsonb, text, jsonb, text, jsonb, numeric, boolean, smallint, smallint, text, text
) to authenticated;

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
