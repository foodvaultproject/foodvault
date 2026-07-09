-- Allow authenticated members to read public pricing/trial settings used by v_trial_banner

create policy "Authenticated read public settings"
  on public.system_settings for select
  to authenticated
  using (true);
