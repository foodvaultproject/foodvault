-- Admin portal repair: restores objects the admin features depend on, for
-- databases where the original admin_portal migration never fully applied.
-- Idempotent and enum-safe (application_status_v2 / listing_status_v2 may be enums).

-- 1. Admins can manage every partner row (suspend / delete / approve).
drop policy if exists "Admins manage all partners" on public.partners;
create policy "Admins manage all partners"
  on public.partners for all
  using (public.is_admin() or auth.uid() = user_id)
  with check (public.is_admin() or auth.uid() = user_id);

-- 2. Approve / reject RPCs (admin-guarded, enum-safe).
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
  set application_status_v2 = 'APPROVED',
      approved_at = now(),
      updated_at = now()
  where id = partner_id
    and application_status_v2::text = 'APPLICATION_UNDER_REVIEW';
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
  set application_status_v2 = 'REJECTED',
      updated_at = now()
  where id = partner_id
    and application_status_v2::text = 'APPLICATION_UNDER_REVIEW';
end;
$$;

grant execute on function public.approve_partner_application(uuid) to authenticated;
grant execute on function public.reject_partner_application(uuid) to authenticated;

-- 3. Audit logs.
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
grant select, insert on public.audit_logs to authenticated;

drop policy if exists "Admins read audit logs" on public.audit_logs;
create policy "Admins read audit logs"
  on public.audit_logs for select using (public.is_admin());

drop policy if exists "Admins insert audit logs" on public.audit_logs;
create policy "Admins insert audit logs"
  on public.audit_logs for insert with check (public.is_admin());

-- 4. Contact enquiries.
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
alter table public.contact_enquiries enable row level security;
grant select, insert, update, delete on public.contact_enquiries to authenticated;
grant insert on public.contact_enquiries to anon;

drop policy if exists "Admins manage enquiries" on public.contact_enquiries;
create policy "Admins manage enquiries"
  on public.contact_enquiries for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can submit an enquiry" on public.contact_enquiries;
create policy "Anyone can submit an enquiry"
  on public.contact_enquiries for insert
  to anon, authenticated
  with check (true);

-- 5. Discover articles.
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
alter table public.discover_articles enable row level security;
grant select, insert, update, delete on public.discover_articles to authenticated;
grant select on public.discover_articles to anon;

drop policy if exists "Admins manage articles" on public.discover_articles;
create policy "Admins manage articles"
  on public.discover_articles for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read published articles" on public.discover_articles;
create policy "Public read published articles"
  on public.discover_articles for select
  to anon, authenticated
  using (status = 'PUBLISHED');

-- 6. Homepage featured.
create table if not exists public.homepage_featured (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('FEATURED_PARTNERS', 'NEW_THIS_WEEK')),
  partner_id uuid not null references public.partners (id) on delete cascade,
  sort_order integer not null default 0,
  unique (section, partner_id)
);
alter table public.homepage_featured enable row level security;
grant select, insert, update, delete on public.homepage_featured to authenticated;
grant select on public.homepage_featured to anon;

drop policy if exists "Admins manage homepage featured" on public.homepage_featured;
create policy "Admins manage homepage featured"
  on public.homepage_featured for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read homepage featured" on public.homepage_featured;
create policy "Public read homepage featured"
  on public.homepage_featured for select
  to anon, authenticated using (true);

-- 7. Admin policies on pre-existing tables (members, system_settings) — guarded
-- so this never fails if the table is absent or already has these policies.
do $$
begin
  if to_regclass('public.members') is not null then
    execute 'grant select, insert, update, delete on public.members to authenticated';
    execute 'drop policy if exists "Admins manage members" on public.members';
    execute 'create policy "Admins manage members" on public.members for all using (public.is_admin()) with check (public.is_admin())';
  end if;

  if to_regclass('public.system_settings') is not null then
    execute 'grant select, insert, update on public.system_settings to authenticated';
    execute 'drop policy if exists "Admins manage settings" on public.system_settings';
    execute 'create policy "Admins manage settings" on public.system_settings for all using (public.is_admin()) with check (public.is_admin())';
    execute 'drop policy if exists "Public read settings" on public.system_settings';
    execute 'create policy "Public read settings" on public.system_settings for select to anon, authenticated using (true)';
  end if;
end $$;

-- 8. Storage bucket for Discover article hero images.
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

drop policy if exists "Article images are publicly readable" on storage.objects;
create policy "Article images are publicly readable"
  on storage.objects for select using (bucket_id = 'article-images');

drop policy if exists "Admins manage article images" on storage.objects;
create policy "Admins manage article images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'article-images' and public.is_admin())
  with check (bucket_id = 'article-images' and public.is_admin());

notify pgrst, 'reload schema';
