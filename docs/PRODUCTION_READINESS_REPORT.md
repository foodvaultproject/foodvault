# FoodVault Affiliate Program — Production Readiness Report

**Phase:** Production Hardening (Pre-Launch)  
**Date:** 30 June 2026  
**Scope:** Security, reliability, auditability, idempotency, admin observability

---

## Summary

The Affiliate Program has completed a production hardening pass focused on abuse protection, scheduled job execution, immutable audit logging, duplicate prevention, admin dashboards, and RLS-safe exports. Core lifecycle functionality from Phases 1–6 remains unchanged.

**Overall readiness assessment:** The platform is structurally ready for controlled rollout. Automated fraud detection flags suspicious activity without blocking legitimate referrals or auto-rejecting commissions. Financial events are audited at the database layer with immutability enforced. Idempotency keys and unique constraints prevent duplicate commissions, invoices, and payouts under webhook retries.

**Recommendation:** ⚠️ **Ready for Soft Launch**

A soft launch is appropriate because hardening infrastructure is in place, but full production confidence depends on running migration `20250703260000_affiliate_program_production_hardening.sql` in Supabase, configuring production cron secrets, and executing one live end-to-end test with real Shopify + Stripe credentials.

---

## Completed Improvements

### 1. Fraud Detection & Rate Limiting

| Item | Implementation |
|------|----------------|
| Rate limiting | `record_affiliate_click` enforces 60 clicks/minute and 15 clicks/10 seconds per IP hash; legitimate users unaffected |
| IP hashing | `/go/[brandSlug]/[affiliateCode]` hashes client IP via SHA-256 before RPC |
| Fraud flags | Automatic flags: `click_spike`, `repeat_ip`, `rapid_clicks`, `possible_self_referral`, `abnormal_traffic` |
| No auto-rejection | Flags are informational only; commissions are never blocked |
| Admin UI | `/admin/affiliate-fraud` — review, dismiss, mark investigated; all actions audit-logged |

### 2. Scheduled Jobs

| Job | Schedule | Execution |
|-----|----------|-----------|
| Commission approval (backup) | Every 5 min | `POST/GET /api/cron/run-frequent` via Vercel Cron |
| Notification processing | Every 5 min | Same route |
| Monthly partner billing | 1st of month 04:00 UTC | `POST/GET /api/cron/run-monthly` via Vercel Cron |
| Monthly affiliate payouts | 1st of month 04:00 UTC | Same route |
| Commission approval (SQL) | Daily 02:00 UTC | pg_cron `foodvault-approve-commissions` when extension available |
| Job tracking | On every run | `scheduled_job_runs` via `record_scheduled_job_run` |

Legacy routes `/api/notifications/cron/process` and `/api/payments/cron/process` updated with job run recording and GET handlers for Vercel compatibility.

**Required env vars:** `CRON_SECRET` (or `NOTIFICATION_CRON_SECRET` / `PAYMENT_CRON_SECRET`)

### 3. Complete Audit Logging

Immutable audit log enforced via `trg_prevent_affiliate_audit_mutation` (no UPDATE/DELETE).

| Event | Source |
|-------|--------|
| Affiliate registration | DB trigger on `affiliates` INSERT |
| Referral link creation | DB trigger on `affiliate_referral_links` INSERT |
| Referral click | `record_affiliate_click` RPC |
| Referral redirect | `record_affiliate_click` RPC |
| Commission created/approved/cancelled/refunded/paid | DB trigger on `commission_records` |
| Invoice generated / partner charged / payment failed | DB trigger on `billing_invoices` |
| Store connected / disconnected | DB trigger on `store_integrations` |
| Notification sent | Notification engine (`logAffiliateAudit`) |
| Fraud flags created/reviewed/dismissed/investigated | RPC + admin update function |
| Admin fraud actions | `admin_update_fraud_flag_status` |

Each record includes timestamp, event type, actor (user/system/admin), entity IDs, and metadata JSON.

### 4. Duplicate Protection (Idempotency)

| Layer | Enforcement |
|-------|-------------|
| Shopify orders | `store_orders(integration_id, external_order_id)` UNIQUE; webhook returns existing order on duplicate |
| Commissions | `commission_records.order_id` UNIQUE (one commission per order) |
| Billing invoices | `billing_invoices.idempotency_key` UNIQUE + `ON CONFLICT DO NOTHING` |
| Invoice line items | `billing_invoice_items.commission_id` UNIQUE |
| Payout batches | `payout_batches.idempotency_key` UNIQUE (monthly key) |
| Payout items | `payout_items.commission_id` UNIQUE + idempotency_key |
| Stripe charges/transfers | Idempotency keys passed to Stripe API |

Webhook retries, duplicate deliveries, payment retries, and manual reprocessing reuse existing records rather than creating duplicates.

### 5. Platform Health Dashboard

Admin page `/admin/affiliate-system-health` powered by `get_platform_health_dashboard()` RPC:

- Store Integration (connected stores, failed connections, Shopify API status)
- Payments (Stripe, pending/failed charges)
- Notifications (queue size, failed emails, retry queue)
- Webhooks (7-day success rate, last success, retry status)
- Affiliate Platform (pending commissions/payouts, fraud flags)
- Scheduled Jobs (last run, last success/failure per job)

Visual indicators: Green = Healthy, Amber = Warning, Red = Action Required.

### 6. Commission Export Verification

| Route | RPC | RLS |
|-------|-----|-----|
| `/api/affiliate/export/commissions` | `get_affiliate_commission_export` | Verifies `auth.uid()` owns affiliate |
| `/api/partner/export/commissions` | `get_partner_commission_export` | Verifies `auth.uid()` owns partner |

CSV format today; RPC JSON response supports future formats (XLSX, PDF) without route redesign.

### 7. Referral Link Path Sync

Partner slug changes trigger `sync_affiliate_referral_link_paths_for_partner` so `/go` paths stay valid.

---

## Verification Results

| Requirement | Status | Notes |
|-------------|--------|-------|
| Rate limiting on public referral endpoints | ✅ Implemented | DB-level in `record_affiliate_click`; `/go` passes IP hash |
| Fraud flags without commission rejection | ✅ Implemented | Flags only; no commission status changes |
| Fraud admin dashboard | ✅ Implemented | `/admin/affiliate-fraud` |
| Scheduled jobs execute | ✅ Configured | Vercel Cron + pg_cron; GET handlers added for Vercel |
| Job run tracking | ✅ Implemented | `scheduled_job_runs` table |
| Immutable audit log | ✅ Implemented | Trigger blocks mutation |
| All minimum audit events | ✅ Implemented | DB triggers + app-level notification audit |
| Idempotent financial records | ✅ Verified | Unique constraints documented above |
| Platform health dashboard | ✅ Implemented | Full admin dashboard |
| Commission CSV export under RLS | ✅ Fixed | Security definer RPCs with ownership check |
| End-to-end live workflow | ⚠️ Manual | Requires production Supabase migration + Stripe/Shopify credentials |

### End-to-End Workflow Checklist (Manual Verification Required)

Run after applying migration and deploying with cron secrets:

- [ ] Affiliate registers → audit `affiliate_registered`
- [ ] Referral link generated → audit `referral_link_created`
- [ ] Referral click via `/go/...` → click recorded, cookie set, audit `referral_click`
- [ ] Redirect to partner store → audit `referral_redirect`
- [ ] Shopify order webhook → commission created (duplicate webhook returns existing)
- [ ] 30-day hold → commission stays `pending`
- [ ] Cron approval → commission `approved`, audit logged
- [ ] Monthly invoice → audit `invoice_generated`
- [ ] Partner charged via Stripe → audit `partner_charged`
- [ ] Payout batch → affiliate paid, audit `affiliate_payout`
- [ ] Notifications delivered → audit `notification_sent`
- [ ] Admin fraud review action → audit logged
- [ ] Partner/affiliate CSV export → only own data returned

---

## Remaining Risks

1. **Migration not yet applied** — Run `20250703260000_affiliate_program_production_hardening.sql` in Supabase SQL Editor before launch.

2. **pg_cron availability** — Supabase free tier may not include pg_cron; commission approval relies on Vercel Cron (`/api/cron/run-frequent`) as primary backup.

3. **CRON_SECRET must be set in Vercel** — Without it, scheduled jobs return 401 and nothing runs.

4. **Shopify theme snippet** — Attribution still requires partner theme integration for `fv_ref` cookie/session; not auto-installed.

5. **Cookie consent** — Referral cookies set without consent banner integration; may need GDPR/CCPA review for EU/NZ markets.

6. **Some notification types** — `WEBHOOK_FAILURE`, `STORE_DISCONNECTED` wired; others may still need emitters as usage grows.

7. **Commission status history** — Status changes are audit-logged but not stored in a separate history table; current status overwrites previous.

8. **Fraud detection tuning** — Thresholds (50/100 clicks/hour, 25 repeat IP/hour) may need adjustment based on real traffic.

9. **No automated E2E test suite** — Verification is manual/checklist-based for this phase.

---

## Production Recommendation

### ⚠️ Ready for Soft Launch

**Justification:**

The hardening phase delivers the required security, observability, and reliability foundations:

- Public referral endpoints are rate-limited and fraud-monitored without blocking legitimate users
- Scheduled jobs are configured with Vercel Cron and tracked in `scheduled_job_runs`
- Financial lifecycle events are immutably audited
- Duplicate webhook/payment handling is idempotent at the database and Stripe layers
- Administrators have fraud review and platform health dashboards
- Commission exports work under RLS via security definer RPCs

**Before full public launch:**

1. Apply migration `20250703260000_affiliate_program_production_hardening.sql`
2. Set `CRON_SECRET`, `REFERRAL_IP_HASH_SALT`, Stripe, and Resend env vars in production
3. Confirm Vercel Cron jobs show successful runs in `scheduled_job_runs`
4. Execute one complete live test order through Shopify → commission → billing → payout
5. Review open fraud flags weekly during soft launch
6. Add cookie consent if targeting regulated markets

After successful soft launch validation (2–4 weeks, ~50+ real referrals, zero duplicate financial records), upgrade recommendation to **✅ Ready for Production**.

---

## Migration Order

1. `20250703240000_affiliate_program_phase5_payments.sql`
2. `20250703250000_affiliate_program_phase6_notifications.sql`
3. `20250703260000_affiliate_program_production_hardening.sql`

## Environment Variables

```
CRON_SECRET
REFERRAL_IP_HASH_SALT          (optional; falls back to CRON_SECRET)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RESEND_API_KEY
NOTIFICATION_FROM_EMAIL
NEXT_PUBLIC_SITE_URL
```

## Admin URLs

| Page | Path |
|------|------|
| Platform Health | `/admin/affiliate-system-health` |
| Fraud Review | `/admin/affiliate-fraud` |
| Transactions | `/admin/affiliate-transactions` |

## Cron Endpoints

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/run-frequent` | `*/5 * * * *` | Approve commissions + process notifications |
| `/api/cron/run-monthly` | `0 4 1 * *` | Generate invoices, charge partners, run payouts |

Authorization: `Authorization: Bearer <CRON_SECRET>`
