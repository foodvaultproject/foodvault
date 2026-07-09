SET session_replication_role = replica;
UPDATE public.system_settings SET
  membership_price_monthly = 9.99,
  trial_length_days = 7,
  platform_name = 'FOODVAULT',
  support_email = 'hello@foodvault.com',
  homepage_headline = 'Member pricing on the food you actually buy.',
  homepage_subheading = 'Join FOODVAULT and access exclusive member pricing from independent food and beverage brands.',
  updated_at = now()
WHERE id = 1;
RESET ALL;
