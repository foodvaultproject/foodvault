-- New partner columns (logo_original_url, logo_crop, etc.) need SELECT grants for
-- authenticated partners reading their own listing during application review.

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
    and column_name <> 'member_code';

  if cols is not null then
    execute format(
      'grant select (%s) on public.partners to anon, authenticated',
      cols
    );
  end if;
end $$;

revoke select (member_code) on public.partners from anon, authenticated;

notify pgrst, 'reload schema';
