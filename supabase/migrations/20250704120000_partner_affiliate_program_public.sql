-- Public check: affiliate program is visible on brand profiles only when setup is complete.

create or replace function public.partner_affiliate_program_is_public(p_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select
        p.affiliate_enabled
        and p.affiliate_commission_percent is not null
        and exists (
          select 1
          from public.store_integrations si
          where si.partner_id = p.id
            and si.platform = 'shopify'
            and si.status = 'connected'
        )
        and exists (
          select 1
          from public.partner_billing_profiles bp
          where bp.partner_id = p.id
            and bp.default_payment_method_id is not null
        )
      from public.partners p
      where p.id = p_partner_id
        and public.partner_is_publicly_visible(p)
    ),
    false
  );
$$;

grant execute on function public.partner_affiliate_program_is_public(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
