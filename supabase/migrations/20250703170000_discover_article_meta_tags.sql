-- Discover article topic/meta tags shown on article pages.
alter table public.discover_articles
  add column if not exists meta_tags text[] not null default '{}';
