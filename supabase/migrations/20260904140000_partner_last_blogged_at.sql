-- Track when a partner was last featured in an automated Discover article.
alter table public.partners
  add column if not exists last_blogged_at timestamptz;

comment on column public.partners.last_blogged_at is
  'When this partner was last used as the subject of a generated Discover article.';
