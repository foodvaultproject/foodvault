-- Retired inbox: support@foodvault.co.nz does not receive mail.
-- Point platform support on notifications and admin settings at Mark.

update public.system_settings
set
  support_email = 'mark@benchmark-int.com',
  updated_at = now()
where lower(trim(coalesce(support_email, ''))) in (
  '',
  'support@foodvault.co.nz',
  'hello@foodvault.co.nz',
  'hello@foodvault.com'
);

notify pgrst, 'reload schema';
