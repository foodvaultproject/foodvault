SET session_replication_role = replica;
UPDATE public.partners SET
  banner_image_url = replace(banner_image_url, 'aqofnwfgrhwiupdxwbpx.supabase.co', 'ujsuhujujdowqpmertmt.supabase.co'),
  logo_url = replace(logo_url, 'aqofnwfgrhwiupdxwbpx.supabase.co', 'ujsuhujujdowqpmertmt.supabase.co'),
  banner_original_url = replace(banner_original_url, 'aqofnwfgrhwiupdxwbpx.supabase.co', 'ujsuhujujdowqpmertmt.supabase.co'),
  logo_original_url = replace(logo_original_url, 'aqofnwfgrhwiupdxwbpx.supabase.co', 'ujsuhujujdowqpmertmt.supabase.co'),
  gallery_image_urls = ARRAY(
    SELECT replace(value, 'aqofnwfgrhwiupdxwbpx.supabase.co', 'ujsuhujujdowqpmertmt.supabase.co')
    FROM unnest(gallery_image_urls) AS value
  ),
  gallery_original_urls = ARRAY(
    SELECT replace(value, 'aqofnwfgrhwiupdxwbpx.supabase.co', 'ujsuhujujdowqpmertmt.supabase.co')
    FROM unnest(gallery_original_urls) AS value
  )
WHERE banner_image_url LIKE '%aqofnwfgrhwiupdxwbpx.supabase.co%'
   OR logo_url LIKE '%aqofnwfgrhwiupdxwbpx.supabase.co%'
   OR banner_original_url LIKE '%aqofnwfgrhwiupdxwbpx.supabase.co%'
   OR logo_original_url LIKE '%aqofnwfgrhwiupdxwbpx.supabase.co%'
   OR EXISTS (
     SELECT 1 FROM unnest(gallery_image_urls) AS value WHERE value LIKE '%aqofnwfgrhwiupdxwbpx.supabase.co%'
   )
   OR EXISTS (
     SELECT 1 FROM unnest(gallery_original_urls) AS value WHERE value LIKE '%aqofnwfgrhwiupdxwbpx.supabase.co%'
   );
UPDATE public.discover_articles
SET hero_image_url = replace(hero_image_url, 'aqofnwfgrhwiupdxwbpx.supabase.co', 'ujsuhujujdowqpmertmt.supabase.co')
WHERE hero_image_url LIKE '%aqofnwfgrhwiupdxwbpx.supabase.co%';
RESET ALL;
