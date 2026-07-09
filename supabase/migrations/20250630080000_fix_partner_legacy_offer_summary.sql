-- Legacy partners columns (continued): offer_summary and other NOT NULL fields
-- from pre-FoodVault schema versions.

alter table public.partners
  add column if not exists offer_summary text,
  add column if not exists member_offer_confirmed boolean default false,
  add column if not exists business_status text default 'active',
  add column if not exists deleted_at timestamptz;

create or replace function public.build_partner_offer_summary(
  p_discount_value text,
  p_offer_type text,
  p_offer_applies_to text,
  p_offer_terms text
)
returns text
language sql
immutable
as $$
  select coalesce(
    nullif(trim(both ' · ' from concat_ws(
      ' · ',
      case
        when nullif(trim(p_discount_value), '') is not null then
          trim(p_discount_value)
          || case
               when trim(p_discount_value) ~ '%' then ' off'
               else '% off'
             end
      end,
      nullif(trim(p_offer_applies_to), ''),
      nullif(trim(p_offer_type), '')
    )), ''),
    nullif(trim(p_offer_terms), ''),
    'Member offer pending review'
  );
$$;

update public.partners
set offer_summary = public.build_partner_offer_summary(
      discount_value,
      offer_type,
      offer_applies_to,
      offer_terms
    )
where offer_summary is null;

update public.partners
set member_offer_confirmed = false
where member_offer_confirmed is null;

create or replace function public.partners_legacy_columns_sync()
returns trigger
language plpgsql
as $$
begin
  if new.description is null then
    new.description := coalesce(
      nullif(trim(new.short_description), ''),
      nullif(trim(new.brand_story), ''),
      nullif(trim(new.business_name), ''),
      'Partner application'
    );
  end if;

  if new.auth_user_id is null and new.user_id is not null then
    new.auth_user_id := new.user_id;
  end if;

  if new.offer_summary is null then
    new.offer_summary := public.build_partner_offer_summary(
      new.discount_value,
      new.offer_type,
      new.offer_applies_to,
      new.offer_terms
    );
  end if;

  if new.member_offer_confirmed is null then
    new.member_offer_confirmed := false;
  end if;

  return new;
end;
$$;

drop trigger if exists partners_legacy_columns_sync on public.partners;
create trigger partners_legacy_columns_sync
  before insert or update on public.partners
  for each row
  execute function public.partners_legacy_columns_sync();

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
  p_member_code text
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
begin
  if v_uid is null then
    raise exception 'Unauthorized';
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
    offer_applies_to,
    offer_terms,
    support_email,
    support_phone,
    instagram,
    facebook,
    linkedin,
    tiktok,
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
    p_offer_applies_to,
    p_offer_terms,
    p_support_email,
    p_support_phone,
    p_instagram,
    p_facebook,
    p_linkedin,
    p_tiktok,
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
    offer_applies_to = excluded.offer_applies_to,
    offer_terms = excluded.offer_terms,
    support_email = excluded.support_email,
    support_phone = excluded.support_phone,
    instagram = excluded.instagram,
    facebook = excluded.facebook,
    linkedin = excluded.linkedin,
    tiktok = excluded.tiktok,
    location = 'New Zealand',
    updated_at = now()
  returning * into v_row;

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

grant execute on function public.submit_partner_application(
  text, text, text, text, text, text[], text, text, text, text, text, text,
  text, text, text, text, text
) to authenticated;

notify pgrst, 'reload schema';
