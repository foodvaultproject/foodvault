-- Add listing status to admin partner contacts directory.
-- Must drop first: PostgreSQL cannot change RETURNS TABLE shape via CREATE OR REPLACE.

drop function if exists public.admin_list_partner_contacts(text);

create function public.admin_list_partner_contacts(p_search text default null)
returns table (
  id uuid,
  business_name text,
  contact_name text,
  support_email text,
  support_phone text,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.business_name,
    p.contact_name,
    p.support_email,
    p.support_phone,
    case
      when p.listing_status_v2::text = 'LIVE' then 'Live'
      when p.application_status_v2::text = 'APPROVED' then 'Pending Activation'
      else null
    end as status
  from public.partners p
  where public.is_admin()
    and (
      p_search is null
      or btrim(p_search) = ''
      or coalesce(p.business_name, '') ilike '%' || p_search || '%'
      or coalesce(p.contact_name, '') ilike '%' || p_search || '%'
      or coalesce(p.support_email, '') ilike '%' || p_search || '%'
      or coalesce(p.support_phone, '') ilike '%' || p_search || '%'
    )
  order by coalesce(p.business_name, '') asc, p.created_at desc;
$$;

grant execute on function public.admin_list_partner_contacts(text) to authenticated;
