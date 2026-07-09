-- Member favorites for saved partner brands

create table if not exists public.member_favorites (
  id uuid primary key default gen_random_uuid(),
  member_auth_user_id uuid not null references auth.users (id) on delete cascade,
  partner_id uuid not null references public.partners (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (member_auth_user_id, partner_id)
);

create index if not exists member_favorites_member_idx
  on public.member_favorites (member_auth_user_id);

create index if not exists member_favorites_partner_idx
  on public.member_favorites (partner_id);

alter table public.member_favorites enable row level security;

create policy "Members read own favorites"
  on public.member_favorites for select
  using (auth.uid() = member_auth_user_id);

create policy "Members insert own favorites"
  on public.member_favorites for insert
  with check (auth.uid() = member_auth_user_id);

create policy "Members delete own favorites"
  on public.member_favorites for delete
  using (auth.uid() = member_auth_user_id);
