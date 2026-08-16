-- Structured hospitality venue location from Nominatim onboarding.

alter table public.partners
  add column if not exists suburb text,
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

comment on column public.partners.suburb is
  'Hospitality venue suburb from Nominatim (or manual edit) during onboarding.';
comment on column public.partners.city is
  'Hospitality venue city/town from Nominatim (or manual edit) during onboarding.';
comment on column public.partners.region is
  'Hospitality venue NZ region from Nominatim (or manual edit) during onboarding.';
comment on column public.partners.latitude is
  'Hospitality venue latitude from Nominatim.';
comment on column public.partners.longitude is
  'Hospitality venue longitude from Nominatim.';

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
