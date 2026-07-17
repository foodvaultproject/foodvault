-- Restructure discover article categories for What's Happening?

UPDATE discover_articles
SET category = 'Saving'
WHERE category = 'Save More Every Week';

UPDATE discover_articles
SET category = 'Brands'
WHERE category = 'Meet Our Partners';

UPDATE discover_articles
SET category = 'Recipes'
WHERE category = 'Recipes & Inspiration';

DELETE FROM discover_articles
WHERE category IN ('Food Buying Guides', 'New Brands This Week');

-- Retire legacy CMS-only categories not shown on the public page
UPDATE discover_articles
SET category = 'News'
WHERE category IN (
  'Affiliate FAQ',
  'Affiliate Terms',
  'Partner Terms',
  'Commission Policy',
  'Cookie Policy',
  'Privacy Policy'
);

-- Ensure publish_date matches article creation when missing
UPDATE discover_articles
SET publish_date = created_at
WHERE publish_date IS NULL;
