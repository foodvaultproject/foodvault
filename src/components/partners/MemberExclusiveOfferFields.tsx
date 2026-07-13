"use client";

import { OfferScopeSelector } from "@/components/partners/OfferScopeSelector";
import { SelectedProductsEditor } from "@/components/partners/SelectedProductsEditor";
import {
  sanitizeDiscountValue,
  type OfferScope,
  type SelectedProductDraft,
} from "@/lib/partner-offer";

type MemberExclusiveOfferFieldsProps = {
  offerScope: OfferScope;
  onOfferScopeChange: (scope: OfferScope) => void;
  discountValue: string;
  onDiscountValueChange: (value: string) => void;
  selectedProducts: SelectedProductDraft[];
  onSelectedProductsChange: (products: SelectedProductDraft[]) => void;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
  helperClass?: string;
  fieldGapClass?: string;
  compact?: boolean;
  discountHelperText?: string;
};

export function MemberExclusiveOfferFields({
  offerScope,
  onOfferScopeChange,
  discountValue,
  onDiscountValueChange,
  selectedProducts,
  onSelectedProductsChange,
  disabled = false,
  inputClass,
  labelClass,
  helperClass = "text-xs leading-snug text-muted-foreground",
  fieldGapClass = "mt-1",
  compact = false,
  discountHelperText = "You can change the discount value at any time.",
}: MemberExclusiveOfferFieldsProps) {
  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div>
        <label className={labelClass}>Discount Applies To</label>
        <div className={fieldGapClass}>
          <OfferScopeSelector
            value={offerScope}
            onChange={onOfferScopeChange}
            disabled={disabled}
          />
        </div>
      </div>

      {offerScope === "entire_store" ? (
        <div>
          <label htmlFor="discountValue" className={labelClass}>
            Discount Value
          </label>
          <div className={`relative max-w-xs ${fieldGapClass}`}>
            <input
              id="discountValue"
              name="discountValue"
              type="text"
              inputMode="numeric"
              maxLength={2}
              required
              disabled={disabled}
              value={discountValue}
              onChange={(event) =>
                onDiscountValueChange(sanitizeDiscountValue(event.target.value))
              }
              placeholder="10"
              className={`${inputClass} pr-10`}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.9375rem] text-muted-foreground">
              %
            </span>
          </div>
          <p className={`${helperClass} mt-1`}>{discountHelperText}</p>
        </div>
      ) : (
        <SelectedProductsEditor
          products={selectedProducts}
          onChange={onSelectedProductsChange}
          disabled={disabled}
          inputClass={inputClass}
          labelClass={labelClass}
          helperClass={helperClass}
          fieldGapClass={fieldGapClass}
          compact={compact}
        />
      )}
    </div>
  );
}
