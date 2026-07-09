-- Fix partner application submit: restore column SELECT (except member_code)
-- and add a security-definer RPC so submit works even if grants drift again.

-- 1. Table write privileges (harmless if already granted).
grant insert, update, delete on public.partners to authenticated;

-- 2. Drop table-level SELECT, then re-grant every column except member_code.
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

-- 3. Ensure partner upsert policies target user_id (not legacy auth_user_id).
drop policy if exists "Partners can insert own record" on public.partners;
create policy "Partners can insert own record"
  on public.partners for insert
  with check (auth.uid() = user_id);

drop policy if exists "Partners can update own record" on public.partners;
create policy "Partners can update own record"
  on public.partners for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep the older policy name in sync for databases that only had listing-status update.
drop policy if exists "Partners can update own listing status" on public.partners;
create policy "Partners can update own listing status"
  on public.partners for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Secure submit RPC — bypasses column-level SELECT restrictions on write path.
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
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  insert into public.partners (
    user_id,
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
