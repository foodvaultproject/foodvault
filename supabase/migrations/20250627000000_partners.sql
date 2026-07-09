-- Partner records and onboarding status (v2)
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  application_status_v2 text not null default 'APPLICATION_UNDER_REVIEW'
    check (application_status_v2 in ('APPLICATION_UNDER_REVIEW', 'APPROVED', 'REJECTED')),
  listing_status_v2 text not null default 'PENDING'
    check (listing_status_v2 in ('PENDING', 'LIVE')),
  member_code text,
  business_name text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partners_user_id_idx on public.partners (user_id);

alter table public.partners enable row level security;

create policy "Partners can read own record"
  on public.partners for select
  using (auth.uid() = user_id);

create policy "Partners can insert own record"
  on public.partners for insert
  with check (auth.uid() = user_id);

create policy "Partners can update own listing status"
  on public.partners for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
