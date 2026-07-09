-- Adds admin portal columns to system_settings (singleton row uses integer id = 1).

alter table public.system_settings
  add column if not exists membership_price_monthly numeric(10, 2) default 20.00,
  add column if not exists trial_length_days integer default 7,
  add column if not exists platform_name text default 'FoodVault',
  add column if not exists support_email text default 'support@foodvault.co.nz',
  add column if not exists homepage_headline text,
  add column if not exists homepage_subheading text,
  add column if not exists updated_at timestamptz default now();

update public.system_settings
set
  membership_price_monthly = coalesce(membership_price_monthly, 20.00),
  trial_length_days = coalesce(trial_length_days, 7),
  platform_name = coalesce(nullif(trim(platform_name), ''), 'FoodVault'),
  support_email = coalesce(nullif(trim(support_email), ''), 'support@foodvault.co.nz'),
  updated_at = coalesce(updated_at, now());

insert into public.system_settings (
  membership_price_monthly,
  trial_length_days,
  platform_name,
  support_email,
  updated_at
)
select
  20.00,
  7,
  'FoodVault',
  'support@foodvault.co.nz',
  now()
where not exists (select 1 from public.system_settings);
