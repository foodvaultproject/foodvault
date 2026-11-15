-- Site-scoped Discover articles. Safe if these columns were added directly in Supabase.

alter table public.discover_articles
  add column if not exists site text not null default 'foodvault';

alter table public.discover_articles
  drop constraint if exists discover_articles_site_check;

alter table public.discover_articles
  add constraint discover_articles_site_check
  check (site in ('foodvault', 'stockup'));

alter table public.discover_articles
  add column if not exists related_product_ids uuid[] not null default '{}';

alter table public.discover_articles
  add column if not exists faqs jsonb not null default '[]'::jsonb;

-- Slugs are unique per site so StockUp and FoodVault can publish independently.
alter table public.discover_articles
  drop constraint if exists discover_articles_slug_key;

create unique index if not exists discover_articles_site_slug_key
  on public.discover_articles (site, slug);

create index if not exists discover_articles_site_status_publish_idx
  on public.discover_articles (site, status, publish_date desc);
