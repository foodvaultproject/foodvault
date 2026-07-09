-- Ensure anonymous visitors can read public membership pricing settings.

drop policy if exists "Public read settings" on public.system_settings;

create policy "Public read settings"
  on public.system_settings
  for select
  to anon, authenticated
  using (true);

grant select on public.system_settings to anon, authenticated;
