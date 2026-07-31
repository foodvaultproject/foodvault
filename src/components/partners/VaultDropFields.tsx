"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  VAULT_DROP_DURATION_OPTIONS,
  VAULT_DROP_REASON_TAGS,
  VAULT_DROP_SECTION_INTRO,
  calculateVaultDropDiscountPercent,
  parsePriceInput,
  sanitizePriceInput,
  vaultDropDiscountError,
  type VaultDropFormDraft,
  type VaultDropStatus,
} from "@/lib/vault-drop";

type VaultDropFieldsProps = {
  value: VaultDropFormDraft;
  onChange: (value: VaultDropFormDraft) => void;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
  helperClass?: string;
  fieldGapClass?: string;
  idPrefix?: string;
};

export function VaultDropFields({
  value,
  onChange,
  disabled = false,
  inputClass,
  labelClass,
  helperClass = "text-xs text-muted-foreground",
  fieldGapClass = "mt-1.5",
  idPrefix = "vault-drop",
}: VaultDropFieldsProps) {
  const originalPrice = parsePriceInput(value.originalPrice);
  const clearancePrice = parsePriceInput(value.clearancePrice);

  const discountPercent = useMemo(() => {
    if (originalPrice == null || clearancePrice == null) return null;
    return calculateVaultDropDiscountPercent(originalPrice, clearancePrice);
  }, [originalPrice, clearancePrice]);

  const discountError = vaultDropDiscountError(originalPrice, clearancePrice);

  function patch(partial: Partial<VaultDropFormDraft>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-4">
      <p className={`${helperClass} rounded-md border border-primary/15 bg-primary/5 px-3 py-2.5 text-[0.8125rem] leading-relaxed text-foreground`}>
        {VAULT_DROP_SECTION_INTRO}
      </p>

      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={value.enabled}
          disabled={disabled}
          onChange={(event) => patch({ enabled: event.target.checked })}
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
        />
        <span className="text-sm text-foreground">
          Create a Vault Drop offer for this listing
        </span>
      </label>

      {value.enabled ? (
        <div className="space-y-4 rounded-md border border-border/80 bg-background/80 p-3 sm:p-4">
          <div>
            <label htmlFor={`${idPrefix}-title`} className={labelClass}>
              Offer Title <span className="text-red-600">*</span>
            </label>
            <input
              id={`${idPrefix}-title`}
              type="text"
              maxLength={120}
              disabled={disabled}
              value={value.title}
              onChange={(event) => patch({ title: event.target.value })}
              placeholder="e.g. Clearance Protein Bars — 40% Off"
              className={`${inputClass} ${fieldGapClass}`}
            />
          </div>

          <div>
            <label htmlFor={`${idPrefix}-description`} className={labelClass}>
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              id={`${idPrefix}-description`}
              rows={3}
              maxLength={500}
              disabled={disabled}
              value={value.description}
              onChange={(event) => patch({ description: event.target.value })}
              placeholder="Tell members what makes this clearance offer special."
              className={`${inputClass} ${fieldGapClass} min-h-[5.5rem] resize-y`}
            />
          </div>

          <div>
            <span className={labelClass}>
              Product Image <span className="text-red-600">*</span>
            </span>
            <div className={`${fieldGapClass} flex flex-wrap items-start gap-3`}>
              {value.imageUrl ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-md border border-border bg-muted">
                  <Image
                    src={value.imageUrl}
                    alt=""
                    fill
                    unoptimized={value.imageUrl.startsWith("blob:")}
                    className="object-cover"
                  />
                </div>
              ) : null}
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-dashed border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50">
                {value.imageUrl ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={disabled}
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    patch({
                      imageFile: file,
                      imageUrl: URL.createObjectURL(file),
                    });
                  }}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${idPrefix}-original-price`} className={labelClass}>
                Original Price (NZD) <span className="text-red-600">*</span>
              </label>
              <input
                id={`${idPrefix}-original-price`}
                type="text"
                inputMode="decimal"
                disabled={disabled}
                value={value.originalPrice}
                onChange={(event) =>
                  patch({ originalPrice: sanitizePriceInput(event.target.value) })
                }
                placeholder="49.99"
                className={`${inputClass} ${fieldGapClass}`}
              />
            </div>
            <div>
              <label htmlFor={`${idPrefix}-clearance-price`} className={labelClass}>
                Clearance Price (NZD) <span className="text-red-600">*</span>
              </label>
              <input
                id={`${idPrefix}-clearance-price`}
                type="text"
                inputMode="decimal"
                disabled={disabled}
                value={value.clearancePrice}
                onChange={(event) =>
                  patch({ clearancePrice: sanitizePriceInput(event.target.value) })
                }
                placeholder="29.99"
                className={`${inputClass} ${fieldGapClass}`}
              />
              {discountPercent != null ? (
                <p
                  className={`mt-1 text-xs ${discountError ? "font-medium text-red-600" : "text-muted-foreground"}`}
                >
                  {discountError ??
                    `Calculated discount: ${discountPercent}% (minimum 30% required)`}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${idPrefix}-reason`} className={labelClass}>
                Reason Tag <span className="text-red-600">*</span>
              </label>
              <select
                id={`${idPrefix}-reason`}
                disabled={disabled}
                value={value.reasonTag}
                onChange={(event) =>
                  patch({
                    reasonTag: event.target.value as VaultDropFormDraft["reasonTag"],
                  })
                }
                className={`${inputClass} ${fieldGapClass}`}
              >
                <option value="">Select a reason</option>
                {VAULT_DROP_REASON_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${idPrefix}-duration`} className={labelClass}>
                Run Duration <span className="text-red-600">*</span>
              </label>
              <select
                id={`${idPrefix}-duration`}
                disabled={disabled}
                value={value.durationDays}
                onChange={(event) =>
                  patch({
                    durationDays: Number(event.target.value) as VaultDropFormDraft["durationDays"],
                  })
                }
                className={`${inputClass} ${fieldGapClass}`}
              >
                {VAULT_DROP_DURATION_OPTIONS.map((days) => (
                  <option key={days} value={days}>
                    {days} {days === 1 ? "day" : "days"}
                  </option>
                ))}
              </select>
              <p className={`${helperClass} mt-1`}>Maximum run time is 7 days.</p>
            </div>
          </div>

          <div>
            <label htmlFor={`${idPrefix}-store-link`} className={labelClass}>
              Direct Store Link <span className="text-red-600">*</span>
            </label>
            <input
              id={`${idPrefix}-store-link`}
              type="url"
              disabled={disabled}
              value={value.directStoreLink}
              onChange={(event) => patch({ directStoreLink: event.target.value })}
              placeholder="https://yourstore.com/vault-drop"
              className={`${inputClass} ${fieldGapClass}`}
            />
          </div>

          <div>
            <label htmlFor={`${idPrefix}-status`} className={labelClass}>
              Status
            </label>
            <select
              id={`${idPrefix}-status`}
              disabled={disabled}
              value={value.status === "ended" ? "draft" : value.status}
              onChange={(event) =>
                patch({ status: event.target.value as VaultDropStatus })
              }
              className={`${inputClass} ${fieldGapClass}`}
            >
              <option value="draft">Draft — not shown on homepage</option>
              <option value="active">Active — live on homepage now</option>
            </select>
          </div>
        </div>
      ) : null}
    </div>
  );
}
