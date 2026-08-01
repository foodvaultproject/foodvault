-- Direct auth.users lookup by email (service role only; replaces paginated listUsers scans).

create or replace function public.admin_get_auth_user_by_email(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_row auth.users%rowtype;
begin
  if p_email is null or trim(p_email) = '' then
    return null;
  end if;

  select * into v_row
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'email', v_row.email,
    'email_confirmed_at', v_row.email_confirmed_at,
    'user_metadata', coalesce(v_row.raw_user_meta_data, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.admin_get_auth_user_by_email(text) from public;
grant execute on function public.admin_get_auth_user_by_email(text) to service_role;

-- Prerequisite for batch lookup (from 20250731220000 if not yet applied).
alter table public.partners
  add column if not exists vault_drop_code text;

create or replace function public.get_partner_vault_drop_code(p_partner_id uuid)
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
  select vault_drop_code, user_id,
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

  if v_is_live and public.member_has_active_access(v_uid) then
    return v_code;
  end if;

  return null;
end;
$$;

grant execute on function public.get_partner_vault_drop_code(uuid) to anon, authenticated;

-- Batch FLASH SALE code resolution for homepage (single round-trip).

create or replace function public.get_partner_vault_drop_codes_batch(p_partner_ids uuid[])
returns table (partner_id uuid, flash_sale_code text)
language sql
stable
security definer
set search_path = public
as $$
  select
    pid as partner_id,
    public.get_partner_vault_drop_code(pid) as flash_sale_code
  from unnest(coalesce(p_partner_ids, array[]::uuid[])) as pid;
$$;

grant execute on function public.get_partner_vault_drop_codes_batch(uuid[]) to anon, authenticated;

notify pgrst, 'reload schema';
