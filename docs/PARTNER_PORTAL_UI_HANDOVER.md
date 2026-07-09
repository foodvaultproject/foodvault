# Partner Portal UI Redesign — Handover Document

**Feature:** Partner Portal compact admin UI (typography, layout, image uploads)  
**Scope:** Visual / UX refactor only — no intended changes to business logic, API contracts, or database schema  
**Last updated:** July 2026

---

## Overview

This work redesigns the **Partner Portal** (logged-in partner experience) to match a compact SaaS admin aesthetic similar to Shopify, Stripe, or Notion. Goals included:

- Smaller, tighter typography hierarchy across portal pages
- Reduced padding and card density
- Thumbnail-based image upload fields instead of large dropzones
- Consistent design tokens shared across portal pages and affiliate sub-views

A separate but related change fixed **homepage hero brand logos** (Dyson, Muscle Nation, Paddock to Pantry, etc.) so circular tiles fill consistently without distortion.

### Portal routes affected

| Route | Page |
|---|---|
| `/partner/listing` | My Listing |
| `/partner/affiliate-program` | Affiliate Program |
| `/partner/account` | My Account |
| `/partner/support` | Support |
| `/partner` | Dashboard |
| `/partner/analytics` | Performance View |
| `/partner/review` | Final Review |

### Typography scale (final)

| Role | Token / CSS class | Size | Weight |
|---|---|---:|---|
| Page title (H1) | `portalPageTitle` → `.portal-page-title` | 22px | 700 |
| Section heading (H2) | `portalSectionTitle` → `.portal-section-title` | 18px | 700 |
| Card / block title (H3) | `portalCardTitle` → `.portal-card-title` | 16px | 600 |
| Field labels | `portalLabel` | 13px | 500 (medium) |
| Body / form inputs / buttons | `portalBody`, `portalInput`, `portalBtn*` | 14px | — |
| Helper / descriptive text | `portalHelper` | 12px | muted |
| Metric values (not headings) | `portalMetricValue` | 18px | 600 |

**Important:** Heading sizes are enforced in `partner-portal.css`, not via Tailwind utility strings alone. See [CSS changes](#css-changes) and [Known issues](#known-issues).

---

## Files created or modified

### Created

| File | Purpose |
|---|---|
| `src/lib/partner-portal-classes.ts` | Central design-token exports for portal UI |
| `src/components/partner-portal/partner-portal.css` | Scoped heading typography (H1/H2/H3) for portal shell |

### Modified — core portal

| File | Changes |
|---|---|
| `src/components/partner-portal/PartnerPortalShell.tsx` | Added `data-partner-portal` wrapper attribute; tightened nav/shell spacing |
| `src/components/partner-portal/PartnerListingEditor.tsx` | Full layout/typography migration; compact upload fields |
| `src/components/partner-portal/PartnerAccountPage.tsx` | Portal token migration |
| `src/components/partner-portal/PartnerSupport.tsx` | Portal token migration |
| `src/components/partner-portal/PartnerDashboard.tsx` | Portal token migration |
| `src/components/partner-portal/PartnerAnalytics.tsx` | Portal token migration |
| `src/components/partner-portal/PartnerFinalReview.tsx` | Portal token migration |
| `src/components/partner-portal/PartnerOnboardingStatusBanner.tsx` | Compact banner typography; portal H1 tokens |
| `src/components/partner-portal/PartnerOnboardingBanner.tsx` | Activation dialog uses portal tokens |
| `src/components/partner-portal/PartnerMobilePreview.tsx` | Sidebar preview (member-facing mock inside phone frame — largely unchanged) |

### Modified — affiliate portal sub-views

| File | Changes |
|---|---|
| `src/components/partner-affiliate/PartnerAffiliateDashboardPage.tsx` | Portal page header tokens |
| `src/components/partner-affiliate/PartnerAffiliateProgramOverview.tsx` | Section/card typography |
| `src/components/partner-affiliate/PartnerAffiliateDirectory.tsx` | Section titles, mobile cards |
| `src/components/partner-affiliate/PartnerAffiliateDetailPanel.tsx` | Panel header and field labels |
| `src/components/partner-affiliate/PartnerAffiliateInsightBanner.tsx` | Card layout and buttons |
| `src/components/partner-affiliate/PartnerAffiliateAnalyticsSection.tsx` | Section titles |
| `src/components/partner-affiliate/PartnerAffiliateOrdersTable.tsx` | Section titles |
| `src/components/partner-affiliate/PartnerReferralLinksTable.tsx` | Section titles |
| `src/components/partner-affiliate/PartnerAffiliateDisabledState.tsx` | Page/card titles |
| `src/components/partner-affiliate/AffiliateSummaryCard.tsx` | Portal tokens |
| `src/components/partner-affiliate/AffiliateCharts.tsx` | Card titles |

### Modified — shared form / upload components

| File | Changes |
|---|---|
| `src/components/partners/PartnerBannerUploadField.tsx` | `variant="compact"` → 240×80 thumbnail |
| `src/components/partners/PartnerLogoUploadField.tsx` | `variant="compact"` → 80×80 circular thumbnail |
| `src/components/partners/PartnerGalleryUploadGrid.tsx` | `variant="compact"` → 96×120 thumbnails |
| `src/components/partners/MemberExclusiveOfferFields.tsx` | `compact` mode + portal class props |
| `src/components/partners/AffiliateProgramFields.tsx` | `compact` mode + portal class props |
| `src/components/partners/SelectedProductsEditor.tsx` | `compact` mode + portal class props |
| `src/components/partner/PartnerCategorySelector.tsx` | `compact` mode + portal class props |
| `src/components/partners/PartnerSocialFields.tsx` | `compact` mode + portal class props |
| `src/components/partners/OfferScopeSelector.tsx` | `compact` mode + portal class props |

### Modified — billing / store integration

| File | Changes |
|---|---|
| `src/components/payment-service/PartnerBillingSection.tsx` | Portal section titles |
| `src/components/store-integration/PartnerStoreIntegrationSection.tsx` | Portal section/card titles |

### Modified — homepage hero logos (related)

| File | Changes |
|---|---|
| `src/lib/partner-logo-crop.ts` | Added `isFullFrameLogoCrop()` helper |
| `src/components/partners/PartnerLogo.tsx` | Hero prefers circular avatar PNG; CSS crop fallback scaling |
| `src/components/home/HomeHero.tsx` | `inset-[8%]` wrapper for hero logo tiles |

### Modified — global CSS

| File | Changes |
|---|---|
| `src/app/globals.css` | Moved `h1`/`h2`/`h3` into `@layer base`; imports `partner-portal.css` |

### Intentionally not changed

| File | Reason |
|---|---|
| `src/components/partner-application/PartnerApplicationPage.tsx` | Public application flow keeps `variant="default"` (larger upload UI) |
| `src/components/partner-application/PartnerCreateAccountPage.tsx` | Public onboarding — marketing-scale typography retained |

---

## Components

### Design token module — `partner-portal-classes.ts`

Single source of truth for portal UI class strings. Import tokens instead of hardcoding Tailwind classes in portal pages.

**Heading tokens** export CSS class names (not Tailwind utilities):

```ts
export const portalPageTitle = "portal-page-title";
export const portalSectionTitle = "portal-section-title";
export const portalCardTitle = "portal-card-title";
```

**Layout / surface tokens** remain Tailwind utility strings:

- `portalPage`, `portalPageNarrow`, `portalPageHeader`, `portalSectionStack`
- `portalCard`, `portalCardContent`
- `portalInput`, `portalSelect`, `portalTextarea`, `portalFieldGap`, `portalFormGrid`
- `portalBtnPrimary`, `portalBtnOutline`, `portalBtnGhost`
- `portalThumbBanner`, `portalThumbLogo`, `portalThumbGallery`

### Portal shell — `PartnerPortalShell.tsx`

Wraps all authenticated portal pages with:

- Left sidebar navigation (desktop)
- Onboarding status banner slot
- Notification bell header row
- **`data-partner-portal`** attribute — required for scoped heading CSS

### Page components

| Component | H1 example | Primary sections |
|---|---|---|
| `PartnerListingEditor` | "Manage Your Listing" | Business Details, Brand Images, Member Offer, Affiliate Program, etc. |
| `PartnerAffiliateDashboardPage` | "Affiliate Program" | Overview, directory, orders, billing tabs |
| `PartnerAccountPage` | "My Account" | Business Information, Security |
| `PartnerSupport` | "Partner Support" | FAQ cards, contact CTA |
| `PartnerDashboard` | Onboarding banner H1 | Metrics, checklist, quick actions |
| `PartnerAnalytics` | "Performance View" | Metric cards, activity sections |

### Compact upload pattern

Upload fields accept `variant="compact"` (or `compact` boolean on form sub-components). Portal listing editor passes compact mode; partner application flow does not.

| Field | Compact dimensions |
|---|---|
| Banner | 240×80 px thumbnail |
| Logo | 80×80 px circular thumbnail |
| Gallery | 96×120 px tiles, flex-wrap grid |

---

## CSS changes

### 1. `partner-portal.css` (authoritative for H1/H2/H3)

Scoped to `[data-partner-portal]` so marketing pages keep global heading sizes.

```css
[data-partner-portal] h1.portal-page-title { font-size: 22px; font-weight: 700; }
[data-partner-portal] h2.portal-section-title { font-size: 18px; font-weight: 700; }
[data-partner-portal] h2.portal-card-title,
[data-partner-portal] h3.portal-card-title { font-size: 16px; font-weight: 600; }
```

**To change portal heading sizes:** edit pixel values in this file.

### 2. `globals.css`

- **`@import "../components/partner-portal/partner-portal.css"`** — ensures portal heading CSS is always bundled
- **Global `h1`/`h2`/`h3` moved into `@layer base`** — marketing site headings (48px / 36px / 28px) remain for public pages; layered rules no longer block overrides

### 3. Tailwind utility tokens (non-heading)

Labels, body, inputs, buttons, cards, etc. still use Tailwind classes from `partner-portal-classes.ts`. These generally work because they use standard utilities (`text-sm`, `text-xs`, etc.) or arbitrary values on non-heading elements.

### Why two systems exist

An earlier approach used Tailwind utility strings for headings (`text-[1.375rem]`, `text-lg`, etc.). This failed because:

1. Global unlayered `h1`/`h2`/`h3` rules in `globals.css` overrode Tailwind utilities on heading elements
2. Tailwind v4 content scanning may not detect class names referenced only via JS constants in a separate `.ts` file, causing rules to be omitted from the build

The CSS-class + `data-partner-portal` approach resolves both issues.

---

## Database / schema changes

**None.** This feature is UI-only. No migrations, Supabase schema updates, or API payload changes were introduced as part of this redesign.

---

## Business logic

**No intentional business logic changes.**

- Listing save/load, onboarding state machine, affiliate analytics queries, billing, and store integration behaviour are unchanged
- Form validation rules and submission handlers were not modified for this UI pass
- Partner application flow (`PartnerApplicationPage`) retains its original larger UI deliberately

Verify during QA that compact upload fields still call the same upload/delete handlers and that listing PATCH payloads are unchanged.

---

## Design decisions

### 1. Compact SaaS admin aesthetic

Portal pages target partners managing listings daily. Large marketing typography (48px H1s) was inappropriate. Final scale: **22 / 18 / 16 / 14 / 13 / 12 px**.

### 2. Token module + scoped CSS for headings

- **Tokens in TS** — consistent imports across 30+ components; single place to rename classes
- **Sizes in CSS file** — reliable cascade; not dependent on Tailwind purge or heading element conflicts

### 3. `data-partner-portal` scoping

Portal heading overrides must not affect public marketing pages, legal pages, or member dashboard. The shell wrapper attribute limits CSS scope.

### 4. Card title token on H2 elements

Some pages use `<h2 className={portalCardTitle}>` (e.g. My Account section blocks). CSS covers both `h2.portal-card-title` and `h3.portal-card-title` at 16px.

### 5. Compact uploads only in portal

Partner **application** (pre-approval) keeps large upload UI for clarity during first-time setup. Portal **listing editor** uses thumbnails to reduce vertical scroll.

### 6. Homepage hero logo fix (separate concern)

Legacy partners stored full-frame crop metadata (`areaPercent` 100×100), causing logos to appear tiny inside hero circles. Fix:

- Prefer pre-rendered circular avatar (`logoUrl`) in hero context
- `isFullFrameLogoCrop()` detects legacy full-frame crops
- CSS crop fallback uses `scale-[1.28]` for full-frame; avatars use `scale-[1.06]`
- Hero tiles use `inset-[8%]` padding wrapper

### 7. Mobile preview unchanged inside phone mock

`PartnerMobilePreview` simulates the **member-facing** profile. Typography inside the mock intentionally mirrors public profile styling, not portal admin tokens.

---

## Remaining TODO items

- [ ] **Visual QA on all portal routes** after cache-clear — confirm H1/H2/H3 sizes in DevTools (22px / 18px / 16px)
- [ ] **Audit non-heading Tailwind arbitrary values** in `partner-portal-classes.ts` (e.g. `text-[0.8125rem]`) — add `@source` or CSS equivalents if any appear missing in production builds
- [ ] **PartnerMobilePreview chrome** — optionally apply `portalLabel` / `portalHelper` to "Live Preview" label and tip box outside the phone frame
- [ ] **PartnerAnalytics lower sections** — verify all cards use `portalCard` / `portalSectionTitle` (partial migration completed)
- [ ] **Consistent semantic HTML** — some card-level titles use `<h2>` where `<h3>` may be more appropriate; low priority accessibility pass
- [ ] **Remove dead code** — confirm no leftover hardcoded `text-2xl`, `rounded-2xl p-6`, or `font-bold` in partner-portal / partner-affiliate folders

---

## Known issues

### 1. Heading sizes require cache refresh

Dev server caching (`.next` folder) can serve stale CSS. After pulling changes:

1. Stop dev server
2. Delete `.next`
3. Run `npm run dev`
4. Hard refresh browser (Ctrl+Shift+R)

### 2. Multiple dev server instances

Starting a second `npm run dev` while port 3000 is occupied spawns on **3001** or exits with "Another next dev server is already running." Use one instance only.

### 3. Unrelated production build failure

`npm run build` may fail on a pre-existing TypeScript error unrelated to this feature:

```
src/app/api/affiliate/export/commissions/route.ts:46
Argument of type 'unknown' is not assignable...
```

Portal UI changes compile successfully; this API route error blocks full production builds.

### 4. Account page uses H2 for card-level sections

"My Account" section headings ("Business Information", "Security") use `portalCardTitle` (16px) on `<h2>` elements. Visually correct; document outline may skip an H2-level section title on that page.

### 5. Supabase network errors in dev

Intermittent `ENOTFOUND aqofnwfgrhwiupdxwbpx.supabase.co` fetch failures in dev logs are environmental, not caused by this UI work.

---

## Suggested next steps

1. **QA checklist** — walk each portal route; inspect computed font sizes on H1 ("Manage Your Listing"), H2 ("Business Details"), and card titles
2. **Fix build blocker** — resolve `commissions/route.ts` TypeScript error before next production deploy
3. **Consider consolidating typography** — if more portal-specific CSS is needed, extend `partner-portal.css` rather than adding Tailwind arbitrary values to the token file
4. **Document token usage for contributors** — add a short comment in `partner-portal-classes.ts` pointing to this handover doc and `partner-portal.css` for heading size edits
5. **Optional: Storybook or visual regression** — snapshot portal pages at 1280px and 375px to catch future heading regressions
6. **Evaluate partner application flow** — decide whether post-approval partners revisiting application pages should also get compact UI

---

## Quick reference — changing portal heading sizes

| What to change | Where |
|---|---|
| H1 size (22px) | `src/components/partner-portal/partner-portal.css` → `.portal-page-title` |
| H2 size (18px) | `partner-portal.css` → `.portal-section-title` |
| Card title size (16px) | `partner-portal.css` → `.portal-card-title` |
| Class names used in JSX | `src/lib/partner-portal-classes.ts` |
| Portal scope attribute | `PartnerPortalShell.tsx` → `data-partner-portal` |

---

## Related documentation

- `docs/PRODUCTION_READINESS_REPORT.md` — existing project readiness notes
- `AGENTS.md` — Next.js conventions for this codebase
