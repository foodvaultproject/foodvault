-- Allow discount-code access when members.id or memberships.auth_user_id matches the session.

create or replace function public.get_partner_discount_code(p_partner_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_owner uuid;
  v_is_live boolean;
begin
  select member_code, user_id,
         (application_status_v2 = 'APPROVED'
          and listing_status_v2 = 'LIVE'
          and coalesce(suspended, false) = false)
    into v_code, v_owner, v_is_live
  from public.partners
  where id = p_partner_id;

  if v_code is null then return null; end if;
  if public.is_admin() then return v_code; end if;
  if v_uid is null then return null; end if;
  if v_owner = v_uid then return v_code; end if;

  if v_is_live and (
    exists (
      select 1
      from public.members m
      where (m.auth_user_id = v_uid or m.id = v_uid)
        and m.deleted_at is null
        and m.membership_status in ('trialing', 'active')
    )
    or exists (
      select 1
      from public.memberships ms
      where ms.auth_user_id = v_uid
        and ms.status in ('trialing', 'active')
    )
  ) then
    return v_code;
  end if;

  return null;
end;
$$;

grant execute on function public.get_partner_discount_code(uuid) to anon, authenticated;
