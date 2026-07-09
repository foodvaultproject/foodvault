-- Let members update/read their profile when linked by auth_user_id or legacy id match.

drop policy if exists "Members read own profile" on public.members;
create policy "Members read own profile"
  on public.members for select
  using (
    (auth.uid() = auth_user_id or auth.uid() = id)
    and deleted_at is null
  );

drop policy if exists "Members update own profile" on public.members;
create policy "Members update own profile"
  on public.members for update
  using (
    (auth.uid() = auth_user_id or auth.uid() = id)
    and deleted_at is null
  )
  with check (auth.uid() = auth_user_id or auth.uid() = id);
