-- Public storage bucket for partner marketing assets (logo, banner, gallery).
-- Files are namespaced by the partner's auth user id: "{auth.uid()}/<file>".

insert into storage.buckets (id, name, public)
values ('partner-assets', 'partner-assets', true)
on conflict (id) do nothing;

-- Anyone can read (public marketing assets shown to logged-out visitors).
drop policy if exists "Partner assets are publicly readable" on storage.objects;
create policy "Partner assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'partner-assets');

-- A partner may only write/replace/delete files inside their own folder.
drop policy if exists "Partners upload own assets" on storage.objects;
create policy "Partners upload own assets"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'partner-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Partners update own assets" on storage.objects;
create policy "Partners update own assets"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'partner-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'partner-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Partners delete own assets" on storage.objects;
create policy "Partners delete own assets"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'partner-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
