-- Per-column filters for admin partner contacts directory.

drop function if exists public.admin_list_partner_contacts(text);

create function public.admin_list_partner_contacts(
  p_search text default null,
  p_business_name text default null,
  p_contact_name text default null,
  p_support_email text default null,
  p_support_phone text default null,
  p_status text default null
)
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
    and (
      p_business_name is null
      or btrim(p_business_name) = ''
      or coalesce(p.business_name, '') ilike '%' || p_business_name || '%'
    )
    and (
      p_contact_name is null
      or btrim(p_contact_name) = ''
      or coalesce(p.contact_name, '') ilike '%' || p_contact_name || '%'
    )
    and (
      p_support_email is null
      or btrim(p_support_email) = ''
      or coalesce(p.support_email, '') ilike '%' || p_support_email || '%'
    )
    and (
      p_support_phone is null
      or btrim(p_support_phone) = ''
      or coalesce(p.support_phone, '') ilike '%' || p_support_phone || '%'
    )
    and (
      p_status is null
      or btrim(p_status) = ''
      or (
        p_status = 'Live'
        and p.listing_status_v2::text = 'LIVE'
      )
      or (
        p_status = 'Pending Activation'
        and p.application_status_v2::text = 'APPROVED'
        and p.listing_status_v2::text <> 'LIVE'
      )
    )
  order by coalesce(p.business_name, '') asc, p.created_at desc;
$$;

grant execute on function public.admin_list_partner_contacts(
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;
