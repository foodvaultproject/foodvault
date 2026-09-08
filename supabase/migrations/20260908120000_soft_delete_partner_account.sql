-- Allow brand partners to remove their public profile (soft-delete).
-- Public listings already hide rows where deleted_at is set.

alter table public.partners
  add column if not exists deleted_at timestamptz;

create or replace function public.soft_delete_partner_account()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_slug text;
  v_deleted_at timestamptz;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.partners
  set
    deleted_at = coalesce(deleted_at, now()),
    listing_status_v2 = 'PENDING',
    updated_at = now()
  where user_id = v_uid
  returning id, slug, deleted_at into v_id, v_slug, v_deleted_at;

  if v_id is null then
    raise exception 'Partner record not found';
  end if;

  begin
    update public.partners
    set
      member_offer_confirmed = false,
      affiliate_enabled = false,
      business_status = 'deleted'
    where id = v_id;
  exception
    when undefined_column then null;
    when invalid_text_representation then null;
    when datatype_mismatch then null;
  end;

  return json_build_object(
    'id', v_id,
    'slug', v_slug,
    'deleted_at', v_deleted_at
  );
end;
$$;

grant execute on function public.soft_delete_partner_account() to authenticated;

create or replace function public.admin_list_partners(p_search text default null)
returns table (
  id uuid, business_name text, primary_category text, application_status_v2 text,
  listing_status_v2 text, suspended boolean, approved_at timestamptz,
  location text, member_code text
)
language sql
stable
security definer
set search_path = public
as $$
  select id, business_name, primary_category, application_status_v2,
         listing_status_v2, suspended, approved_at, location, member_code
  from public.partners
  where public.is_admin()
    and deleted_at is null
    and (
      p_search is null or p_search = ''
      or business_name ilike '%' || p_search || '%'
      or member_code ilike '%' || p_search || '%'
      or location ilike '%' || p_search || '%'
    )
  order by created_at desc;
$$;

notify pgrst, 'reload schema';
