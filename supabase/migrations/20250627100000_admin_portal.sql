-- FoodVault OS Admin Portal schema

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'Administrator',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where auth_user_id = auth.uid()
  );
$$;

alter table public.partners
  add column if not exists short_description text,
  add column if not exists brand_story text,
  add column if not exists primary_category text,
  add column if not exists subcategories text[] default '{}',
  add column if not exists offer_type text,
  add column if not exists discount_value text,
  add column if not exists offer_applies_to text,
  add column if not exists offer_terms text,
  add column if not exists support_email text,
  add column if not exists support_phone text,
  add column if not exists instagram text,
  add column if not exists facebook text,
  add column if not exists linkedin text,
  add column if not exists tiktok text,
  add column if not exists location text default 'New Zealand',
  add column if not exists suspended boolean not null default false,
  add column if not exists approved_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  status text not null default 'TRIAL'
    check (status in ('ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED')),
  subscription_status text not null default 'TRIAL'
    check (subscription_status in ('ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED')),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  name text not null,
  email text not null,
  enquiry_type text not null
    check (enquiry_type in ('MEMBER', 'PARTNER', 'GENERAL')),
  subject text not null,
  message text not null,
  status text not null default 'NEW'
    check (status in ('NEW', 'OPEN', 'RESOLVED', 'CLOSED')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discover_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  status text not null default 'DRAFT'
    check (status in ('PUBLISHED', 'DRAFT', 'ARCHIVED')),
  summary text,
  body text,
  hero_image_url text,
  meta_title text,
  meta_description text,
  featured boolean not null default false,
  publish_date timestamptz,
  author_name text,
  read_time_minutes integer default 5,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.system_settings (
  id integer primary key default 1 check (id = 1),
  platform_name text not null default 'FoodVault OS',
  membership_price_nzd numeric(10, 2) not null default 299.00,
  trial_length_days integer not null default 14,
  support_email text not null default 'ops@foodvault-os.co.nz',
  homepage_headline text default 'Premium Logistics for Modern Food Businesses',
  homepage_subheading text default 'FoodVault OS provides the infrastructure you need to scale your supply chain, manage partners, and deliver fresh quality at scale.',
  updated_at timestamptz not null default now()
);

insert into public.system_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.homepage_featured (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('FEATURED_PARTNERS', 'NEW_THIS_WEEK')),
  partner_id uuid not null references public.partners (id) on delete cascade,
  sort_order integer not null default 0,
  unique (section, partner_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.approve_partner_application(partner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  update public.partners
  set
    application_status_v2 = 'APPROVED',
    approved_at = now(),
    updated_at = now()
  where id = partner_id
    and application_status_v2 = 'APPLICATION_UNDER_REVIEW';
end;
$$;

create or replace function public.reject_partner_application(partner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  update public.partners
  set
    application_status_v2 = 'REJECTED',
    updated_at = now()
  where id = partner_id
    and application_status_v2 = 'APPLICATION_UNDER_REVIEW';
end;
$$;

alter table public.admin_users enable row level security;
alter table public.members enable row level security;
alter table public.contact_enquiries enable row level security;
alter table public.discover_articles enable row level security;
alter table public.system_settings enable row level security;
alter table public.homepage_featured enable row level security;
alter table public.audit_logs enable row level security;

create policy "Admins read own admin profile"
  on public.admin_users for select
  using (auth_user_id = auth.uid() or public.is_admin());

create policy "Admins manage members"
  on public.members for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage enquiries"
  on public.contact_enquiries for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage articles"
  on public.discover_articles for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage settings"
  on public.system_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage homepage featured"
  on public.homepage_featured for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins read audit logs"
  on public.audit_logs for select
  using (public.is_admin());

create policy "Admins insert audit logs"
  on public.audit_logs for insert
  with check (public.is_admin());

create policy "Admins manage all partners"
  on public.partners for all
  using (public.is_admin() or auth.uid() = user_id)
  with check (public.is_admin() or auth.uid() = user_id);
