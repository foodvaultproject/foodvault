-- Security Advisor fixes (foodvault PRODUCTION)
-- Safe: does not touch auth, Stripe RPCs, partner onboarding, or public catalog views.

alter table public.affiliate_notification_events enable row level security;
revoke all on public.affiliate_notification_events from anon;

alter table public.billing_invoice_items enable row level security;
revoke all on public.billing_invoice_items from anon, authenticated;

alter table public.store_order_items enable row level security;
revoke all on public.store_order_items from anon, authenticated;

alter table public.commission_refund_events enable row level security;
revoke all on public.commission_refund_events from anon, authenticated;

drop view if exists public.v_trial_banner;
drop view if exists public.v_active_partners;

notify pgrst, 'reload schema';
