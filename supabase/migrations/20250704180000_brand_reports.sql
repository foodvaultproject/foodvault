-- Brand profile reports (member-submitted, admin-reviewed)

create sequence if not exists public.brand_report_reference_seq start 1;

create table if not exists public.brand_reports (
  id uuid primary key default gen_random_uuid(),
  report_reference text not null unique,
  brand_id uuid not null references public.partners (id) on delete cascade,
  reporter_user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (
    reason in (
      'misleading_information',
      'incorrect_discounts',
      'offensive_content',
      'copyright_infringement',
      'scam_fraud',
      'counterfeit_products',
      'dangerous_products',
      'spam',
      'other'
    )
  ),
  description text not null check (char_length(trim(description)) between 1 and 1000),
  contact_permission boolean not null default false,
  reporter_email text,
  attachment_urls text[] not null default '{}',
  status text not null default 'New' check (
    status in ('New', 'Under Review', 'Awaiting Information', 'Resolved', 'Dismissed')
  ),
  priority text not null default 'Medium' check (
    priority in ('Critical', 'High', 'Medium', 'Low')
  ),
  admin_notes text,
  assigned_admin_id uuid references public.admin_users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brand_reports_brand_id_idx on public.brand_reports (brand_id);
create index if not exists brand_reports_reporter_user_id_idx on public.brand_reports (reporter_user_id);
create index if not exists brand_reports_status_idx on public.brand_reports (status);
create index if not exists brand_reports_priority_idx on public.brand_reports (priority);
create index if not exists brand_reports_created_at_idx on public.brand_reports (created_at desc);

create table if not exists public.brand_report_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.brand_reports (id) on delete cascade,
  event_type text not null check (
    event_type in (
      'submitted',
      'assigned',
      'priority_changed',
      'status_changed',
      'note_added',
      'info_requested',
      'resolved',
      'dismissed'
    )
  ),
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  admin_user_id uuid references public.admin_users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists brand_report_events_report_id_idx
  on public.brand_report_events (report_id, created_at desc);

create or replace function public.brand_report_priority_for_reason(p_reason text)
returns text
language sql
immutable
as $$
  select case
    when p_reason in ('scam_fraud', 'dangerous_products') then 'Critical'
    when p_reason in ('counterfeit_products', 'copyright_infringement') then 'High'
    when p_reason in ('offensive_content', 'incorrect_discounts', 'misleading_information') then 'Medium'
    else 'Low'
  end;
$$;

create or replace function public.generate_brand_report_reference()
returns text
language plpgsql
as $$
declare
  v_num bigint;
begin
  v_num := nextval('public.brand_report_reference_seq');
  return 'BR-' || lpad(v_num::text, 6, '0');
end;
$$;

create or replace function public.submit_brand_report(
  p_brand_id uuid,
  p_reason text,
  p_description text,
  p_contact_permission boolean default false,
  p_attachment_urls text[] default '{}'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_reference text;
  v_report_id uuid;
  v_priority text;
  v_today_count integer;
  v_duplicate_count integer;
  v_normalized_description text := trim(p_description);
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if exists (
    select 1 from public.partners p where p.user_id = v_user_id
  ) then
    raise exception 'Partners cannot submit brand reports';
  end if;

  if not exists (
    select 1 from public.partners p
    where p.id = p_brand_id and public.partner_is_publicly_visible(p)
  ) then
    raise exception 'Brand not found';
  end if;

  if p_reason not in (
    'misleading_information',
    'incorrect_discounts',
    'offensive_content',
    'copyright_infringement',
    'scam_fraud',
    'counterfeit_products',
    'dangerous_products',
    'spam',
    'other'
  ) then
    raise exception 'Invalid report reason';
  end if;

  if char_length(v_normalized_description) < 1 or char_length(v_normalized_description) > 1000 then
    raise exception 'Description must be between 1 and 1000 characters';
  end if;

  if coalesce(array_length(p_attachment_urls, 1), 0) > 5 then
    raise exception 'Maximum of 5 attachments allowed';
  end if;

  select count(*) into v_today_count
  from public.brand_reports br
  where br.reporter_user_id = v_user_id
    and br.created_at >= date_trunc('day', now());

  if v_today_count >= 5 then
    raise exception 'Daily report limit reached. You can submit up to 5 reports per day.';
  end if;

  select count(*) into v_duplicate_count
  from public.brand_reports br
  where br.reporter_user_id = v_user_id
    and br.brand_id = p_brand_id
    and br.created_at >= now() - interval '30 days'
    and lower(trim(br.description)) = lower(v_normalized_description);

  if v_duplicate_count > 0 then
    raise exception 'You already submitted a similar report for this brand within the last 30 days.';
  end if;

  select email into v_email from auth.users where id = v_user_id;
  v_reference := public.generate_brand_report_reference();
  v_priority := public.brand_report_priority_for_reason(p_reason);

  insert into public.brand_reports (
    report_reference,
    brand_id,
    reporter_user_id,
    reason,
    description,
    contact_permission,
    reporter_email,
    attachment_urls,
    status,
    priority
  ) values (
    v_reference,
    p_brand_id,
    v_user_id,
    p_reason,
    v_normalized_description,
    coalesce(p_contact_permission, false),
    case when coalesce(p_contact_permission, false) then v_email else null end,
    coalesce(p_attachment_urls, '{}'),
    'New',
    v_priority
  )
  returning id into v_report_id;

  insert into public.brand_report_events (
    report_id,
    event_type,
    description
  ) values (
    v_report_id,
    'submitted',
    'Report submitted'
  );

  return json_build_object(
    'id', v_report_id,
    'report_reference', v_reference
  );
end;
$$;

grant execute on function public.submit_brand_report(uuid, text, text, boolean, text[]) to authenticated;

alter table public.brand_reports enable row level security;
alter table public.brand_report_events enable row level security;

drop policy if exists brand_reports_admin_all on public.brand_reports;
create policy brand_reports_admin_all on public.brand_reports
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists brand_report_events_admin_all on public.brand_report_events;
create policy brand_report_events_admin_all on public.brand_report_events
  for all using (public.is_admin()) with check (public.is_admin());

-- Private storage for report evidence attachments
insert into storage.buckets (id, name, public)
values ('brand-report-attachments', 'brand-report-attachments', false)
on conflict (id) do nothing;

drop policy if exists brand_report_attachments_member_insert on storage.objects;
create policy brand_report_attachments_member_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'brand-report-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists brand_report_attachments_admin_select on storage.objects;
create policy brand_report_attachments_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'brand-report-attachments' and public.is_admin());

drop policy if exists brand_report_attachments_member_select on storage.objects;
create policy brand_report_attachments_member_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'brand-report-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

notify pgrst, 'reload schema';
