-- Admin partner contact directory (internal contact details from partner applications).

create or replace function public.admin_list_partner_contacts(p_search text default null)
returns table (
  id uuid,
  business_name text,
  contact_name text,
  support_email text,
  support_phone text
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
    p.support_phone
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
