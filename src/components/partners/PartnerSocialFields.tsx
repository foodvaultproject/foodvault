"use client";

import {
  SOCIAL_FIELD_CONFIG,
  SOCIAL_FIELD_ORDER,
  type PartnerSocialLinks,
  type SocialFieldErrors,
  type SocialFieldKey,
} from "@/lib/partner-social";

type PartnerSocialFieldsProps = {
  values: PartnerSocialLinks;
  onChange: (field: SocialFieldKey, value: string) => void;
  errors?: SocialFieldErrors;
  disabled?: boolean;
  inputClassName?: string;
  labelClassName?: string;
  helperClassName?: string;
  fieldGapClass?: string;
  layout?: "stack" | "grid";
  idPrefix?: string;
};

export function PartnerSocialFields({
  values,
  onChange,
  errors = {},
  disabled = false,
  inputClassName = "",
  labelClassName = "text-sm font-medium text-foreground",
  helperClassName = "text-sm text-red-600",
  fieldGapClass = "mt-1",
  layout = "stack",
  idPrefix = "social",
}: PartnerSocialFieldsProps) {
  const containerClass =
    layout === "grid" ? "mt-3 grid gap-4 sm:grid-cols-2" : "mt-4 space-y-4";

  return (
    <div className={containerClass}>
      {SOCIAL_FIELD_ORDER.map((field) => {
        const { label, placeholder } = SOCIAL_FIELD_CONFIG[field];
        const error = errors[field];
        const inputId = `${idPrefix}-${field}`;

        return (
          <div key={field}>
            <label htmlFor={inputId} className={labelClassName}>
              {label}
            </label>
            <input
              id={inputId}
              name={field}
              type="text"
              inputMode={field === "instagram" || field === "tiktok" ? "text" : "url"}
              value={values[field]}
              onChange={(event) => onChange(field, event.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${inputId}-error` : undefined}
              className={`${fieldGapClass} ${inputClassName}${
                error ? " border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
              }`}
            />
            {error ? (
              <p id={`${inputId}-error`} className={`${helperClassName} mt-1`} role="alert">
                {error}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
