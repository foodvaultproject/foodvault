-- Partner confirms their member discount code is live on their website.

create or replace function public.confirm_partner_offer_live(p_partner_id uuid)
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

  update public.partners
  set listing_status_v2 = 'LIVE',
      member_offer_confirmed = true,
      updated_at = now()
  where id = p_partner_id
    and user_id = v_uid
    and application_status_v2::text in ('APPROVED', 'approved')
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Partner record not found or not approved';
  end if;

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

grant execute on function public.confirm_partner_offer_live(uuid) to authenticated;

notify pgrst, 'reload schema';
