"use client";

import {
  AFFILIATE_COOKIE_DURATION_OPTIONS,
  MAX_AFFILIATE_DESCRIPTION_LENGTH,
  MAX_AFFILIATE_TERMS_LENGTH,
  MAX_AFFILIATE_COMMISSION_PERCENT,
  sanitizeAffiliateCommissionValue,
  type AffiliateCookieDurationDays,
  type AffiliateProgramConfig,
} from "@/lib/partner-affiliate";
import { portalTextarea } from "@/lib/partner-portal-classes";

export const AFFILIATE_PROGRAM_SECTION_DESCRIPTION =
  "Want more people talking about your brand? Turn on the affiliate program and let approved creators promote your products. You choose the commission and can disable it at any time.";

type AffiliateProgramFieldsProps = {
  value: AffiliateProgramConfig;
  onChange: (value: AffiliateProgramConfig) => void;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
  helperClass?: string;
  fieldGapClass?: string;
  compact?: boolean;
  idPrefix?: string;
};

export function AffiliateProgramFields({
  value,
  onChange,
  disabled = false,
  inputClass,
  labelClass,
  helperClass = "text-xs leading-snug text-muted-foreground",
  fieldGapClass = "mt-1",
  compact = false,
  idPrefix = "affiliate",
}: AffiliateProgramFieldsProps) {
  const enabledId = `${idPrefix}-enabled`;
  const commissionId = `${idPrefix}-commission`;
  const cookieId = `${idPrefix}-cookie-duration`;
  const descriptionId = `${idPrefix}-description`;
  const termsId = `${idPrefix}-terms`;

  function patch(partial: Partial<AffiliateProgramConfig>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <p className={`${helperClass} leading-relaxed`}>
        {AFFILIATE_PROGRAM_SECTION_DESCRIPTION}
      </p>

      <label htmlFor={enabledId} className="flex items-start gap-2.5">
        <input
          id={enabledId}
          type="checkbox"
          checked={value.enabled}
          disabled={disabled}
          onChange={(event) => patch({ enabled: event.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <span className={labelClass}>Enable Affiliate Program</span>
      </label>

      {value.enabled ? (
        <>
          <div>
            <label htmlFor={commissionId} className={labelClass}>
              Commission Percentage <span className="text-red-600">*</span>
            </label>
            <div className={`relative max-w-xs ${fieldGapClass}`}>
              <input
                id={commissionId}
                name={commissionId}
                type="text"
                inputMode="numeric"
                required
                disabled={disabled}
                value={value.commissionPercent}
                onChange={(event) =>
                  patch({
                    commissionPercent: sanitizeAffiliateCommissionValue(event.target.value),
                  })
                }
                placeholder="10"
                className={`${inputClass} pr-10`}
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.9375rem] text-muted-foreground">
                %
              </span>
            </div>
            <p className={`${helperClass} mt-1`}>
              Whole numbers only, max {MAX_AFFILIATE_COMMISSION_PERCENT}
            </p>
          </div>

          <div>
            <label htmlFor={cookieId} className={labelClass}>
              Cookie Duration <span className="text-red-600">*</span>
            </label>
            <select
              id={cookieId}
              name={cookieId}
              required
              disabled={disabled}
              value={value.cookieDurationDays}
              onChange={(event) =>
                patch({
                  cookieDurationDays: Number(
                    event.target.value
                  ) as AffiliateCookieDurationDays,
                })
              }
              className={`max-w-xs ${fieldGapClass} ${inputClass}`}
            >
              {AFFILIATE_COOKIE_DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={descriptionId} className={labelClass}>
              Affiliate Program Description (Optional)
            </label>
            <input
              id={descriptionId}
              name={descriptionId}
              type="text"
              disabled={disabled}
              maxLength={MAX_AFFILIATE_DESCRIPTION_LENGTH}
              value={value.programDescription}
              onChange={(event) => patch({ programDescription: event.target.value })}
              placeholder="Earn commission by referring customers to our range of healthy snacks."
              className={`${fieldGapClass} ${inputClass}`}
            />
            <p className={`${helperClass} mt-1`}>
              {value.programDescription.length} / {MAX_AFFILIATE_DESCRIPTION_LENGTH} characters
            </p>
            <p className={`${helperClass} mt-0.5`}>
              This text will appear on the Brand Profile page.
            </p>
          </div>

          <div>
            <label htmlFor={termsId} className={labelClass}>
              Affiliate Terms (Optional)
            </label>
            <textarea
              id={termsId}
              name={termsId}
              rows={compact ? 3 : 4}
              disabled={disabled}
              maxLength={MAX_AFFILIATE_TERMS_LENGTH}
              value={value.affiliateTerms}
              onChange={(event) => patch({ affiliateTerms: event.target.value })}
              placeholder={
                "Excludes wholesale orders.\nCommission is not paid on refunded purchases.\nAvailable in New Zealand only."
              }
              className={`${fieldGapClass} ${portalTextarea}`}
            />
            <p className={`${helperClass} mt-1`}>
              {value.affiliateTerms.length} / {MAX_AFFILIATE_TERMS_LENGTH} characters
            </p>
          </div>

          <div className="rounded-lg bg-surface-lavender px-4 py-3">
            <p className="text-sm font-semibold text-foreground">FoodVault automatically:</p>
            <ul className={`${helperClass} mt-1.5 list-disc space-y-0.5 pl-5`}>
              <li>Approves affiliates</li>
              <li>Tracks referrals</li>
              <li>Calculates commissions</li>
              <li>Manages affiliate payouts</li>
            </ul>
            <p className={`${helperClass} mt-2`}>
              Brands do not manually manage affiliates.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
