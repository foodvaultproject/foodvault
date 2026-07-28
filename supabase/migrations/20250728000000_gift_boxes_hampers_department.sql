-- Gift Boxes & Hampers department taxonomy reference.
-- Application code in src/data/partner-categories.ts remains the source of truth;
-- this table documents and validates the canonical subcategory list for admin/reporting.

create table if not exists public.partner_taxonomy_subcategories (
  department text not null,
  subcategory_group text,
  subcategory text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (department, subcategory)
);

create index if not exists partner_taxonomy_subcategories_department_idx
  on public.partner_taxonomy_subcategories (department);

comment on table public.partner_taxonomy_subcategories is
  'Canonical partner department subcategories, including grouped Gift Boxes & Hampers taxonomy.';

insert into public.partner_taxonomy_subcategories (department, subcategory_group, subcategory, sort_order)
values
  ('Gift Boxes & Hampers', 'Gift Type', 'Gourmet Food', 1),
  ('Gift Boxes & Hampers', 'Gift Type', 'Chocolate & Sweet Treats', 2),
  ('Gift Boxes & Hampers', 'Gift Type', 'Wine & Beverage Gifts', 3),
  ('Gift Boxes & Hampers', 'Gift Type', 'Coffee & Tea', 4),
  ('Gift Boxes & Hampers', 'Gift Type', 'Healthy & Organic', 5),
  ('Gift Boxes & Hampers', 'Gift Type', 'Artisan & Local', 6),
  ('Gift Boxes & Hampers', 'Gift Type', 'Luxury Hampers', 7),
  ('Gift Boxes & Hampers', 'Gift Type', 'Corporate Gifts', 8),
  ('Gift Boxes & Hampers', 'Gift Type', 'Build Your Own', 9),
  ('Gift Boxes & Hampers', 'Gift Type', 'Baby & New Parent', 10),
  ('Gift Boxes & Hampers', 'Gift Type', 'Wellness & Self Care', 11),
  ('Gift Boxes & Hampers', 'Gift Type', 'Eco-Friendly Gifts', 12),
  ('Gift Boxes & Hampers', 'Gift Type', 'Seasonal Collections', 13),
  ('Gift Boxes & Hampers', 'Occasion', 'Birthday', 14),
  ('Gift Boxes & Hampers', 'Occasion', 'Thank You', 15),
  ('Gift Boxes & Hampers', 'Occasion', 'Congratulations', 16),
  ('Gift Boxes & Hampers', 'Occasion', 'Get Well Soon', 17),
  ('Gift Boxes & Hampers', 'Occasion', 'New Baby', 18),
  ('Gift Boxes & Hampers', 'Occasion', 'Housewarming', 19),
  ('Gift Boxes & Hampers', 'Occasion', 'Anniversary', 20),
  ('Gift Boxes & Hampers', 'Occasion', 'Christmas', 21),
  ('Gift Boxes & Hampers', 'Occasion', 'Mother''s Day', 22),
  ('Gift Boxes & Hampers', 'Occasion', 'Father''s Day', 23),
  ('Gift Boxes & Hampers', 'Occasion', 'Valentine''s Day', 24),
  ('Gift Boxes & Hampers', 'Occasion', 'Corporate Gifting', 25)
on conflict (department, subcategory) do update
set
  subcategory_group = excluded.subcategory_group,
  sort_order = excluded.sort_order;
