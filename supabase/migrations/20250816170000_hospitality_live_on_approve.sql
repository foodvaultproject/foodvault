-- Hospitality venues go live as soon as an admin approves the application.
-- Online brands still stay PENDING until the partner confirms their member offer.

create or replace function public.approve_partner_application(partner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  update public.partners
  set application_status_v2 = 'APPROVED',
      approved_at = now(),
      updated_at = now()
  where id = partner_id
    and application_status_v2::text = 'APPLICATION_UNDER_REVIEW';

  update public.partners
  set listing_status_v2 = 'LIVE',
      member_offer_confirmed = true,
      updated_at = now()
  where id = partner_id
    and listing_model = 'hospitality_venue'
    and application_status_v2::text = 'APPROVED';
end;
$$;

grant execute on function public.approve_partner_application(uuid) to authenticated;

update public.partners
set listing_status_v2 = 'LIVE',
    member_offer_confirmed = true,
    updated_at = now()
where listing_model = 'hospitality_venue'
  and application_status_v2::text = 'APPROVED'
  and listing_status_v2::text is distinct from 'LIVE'
  and coalesce(suspended, false) = false;
