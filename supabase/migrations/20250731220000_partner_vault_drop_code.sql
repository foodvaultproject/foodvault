-- Second discount code for FLASH SALE (vault drop) items. Same access pattern as member_code.

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

-- Re-grant column SELECT excluding both secret code columns.
grant insert, update, delete on public.partners to authenticated;

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
    and column_name not in ('member_code', 'vault_drop_code');

  if cols is not null then
    execute format(
      'grant select (%s) on public.partners to anon, authenticated',
      cols
    );
  end if;
end $$;

revoke select (member_code) on public.partners from anon, authenticated;
revoke select (vault_drop_code) on public.partners from anon, authenticated;

notify pgrst, 'reload schema';
