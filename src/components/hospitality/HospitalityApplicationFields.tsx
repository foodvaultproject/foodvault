"use client";

import type { ReactNode } from "react";
import { WeeklyHoursEditor } from "@/components/hospitality/WeeklyHoursEditor";
import {
  HOSPITALITY_OFFER_CATEGORY_LABELS,
  HOSPITALITY_REDEMPTION_CAP_LABEL,
  HOSPITALITY_VENUE_TYPE_LABELS,
  NZ_REGIONS,
} from "@/lib/hospitality/constants";
import { capitalizeSentences } from "@/lib/hospitality/text";
import {
  HOSPITALITY_OFFER_CATEGORIES,
  HOSPITALITY_VENUE_TYPES,
  type HospitalityApplicationDetails,
  type HospitalityLocation,
} from "@/lib/hospitality/types";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "text-sm font-bold text-foreground";

type HospitalityFieldsProps = {
  value: HospitalityApplicationDetails;
  onChange: (value: HospitalityApplicationDetails) => void;
  disabled?: boolean;
  addressField?: ReactNode;
};

function patchDetails(
  value: HospitalityApplicationDetails,
  onChange: (value: HospitalityApplicationDetails) => void,
  partial: Partial<HospitalityApplicationDetails>
) {
  onChange({ ...value, ...partial });
}

export function HospitalityVenueFields({
  value,
  onChange,
  disabled = false,
  addressField,
}: HospitalityFieldsProps) {
  function patchLocation(partial: Partial<HospitalityLocation>) {
    const next = { ...value.location, ...partial };
    next.displayName = [next.street, next.suburb, next.city, next.region]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ");
    patchDetails(value, onChange, { location: next });
  }

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label htmlFor="hospitality-venue-type" className={labelClass}>
          Venue Type <span className="text-primary">*</span>
        </label>
        <select
          id="hospitality-venue-type"
          required
          value={value.venueType}
          disabled={disabled}
          onChange={(event) =>
            patchDetails(value, onChange, {
              venueType: event.target.value as HospitalityApplicationDetails["venueType"],
            })
          }
          className={`mt-1 ${inputClass}`}
        >
          <option value="">Select venue type</option>
          {HOSPITALITY_VENUE_TYPES.map((type) => (
            <option key={type} value={type}>
              {HOSPITALITY_VENUE_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      {addressField}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="hospitality-street" className={labelClass}>
            Street
          </label>
          <input
            id="hospitality-street"
            value={value.location.street}
            disabled={disabled}
            onChange={(event) => patchLocation({ street: event.target.value })}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="hospitality-suburb" className={labelClass}>
            Suburb
          </label>
          <input
            id="hospitality-suburb"
            value={value.location.suburb}
            disabled={disabled}
            onChange={(event) => patchLocation({ suburb: event.target.value })}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="hospitality-city" className={labelClass}>
            City
          </label>
          <input
            id="hospitality-city"
            value={value.location.city}
            disabled={disabled}
            onChange={(event) => patchLocation({ city: event.target.value })}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="hospitality-region" className={labelClass}>
            Region
          </label>
          <select
            id="hospitality-region"
            value={value.location.region}
            disabled={disabled}
            onChange={(event) => patchLocation({ region: event.target.value })}
            className={`mt-1 ${inputClass}`}
          >
            <option value="">Select a region</option>
            {NZ_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>

      <WeeklyHoursEditor
        value={value.openingHours}
        onChange={(openingHours) => patchDetails(value, onChange, { openingHours })}
        disabled={disabled}
      />

      <div>
        <label htmlFor="hospitality-phone" className={labelClass}>
          Venue Phone (Optional)
        </label>
        <input
          id="hospitality-phone"
          type="tel"
          value={value.phone}
          disabled={disabled}
          onChange={(event) =>
            patchDetails(value, onChange, { phone: event.target.value })
          }
          placeholder="e.g. 04 555 0121"
          className={`mt-1 ${inputClass}`}
        />
      </div>
    </div>
  );
}

export function HospitalityOfferFields({
  value,
  onChange,
  disabled = false,
}: HospitalityFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="hospitality-offer-category" className={labelClass}>
            Offer Category <span className="text-primary">*</span>
          </label>
          <select
            id="hospitality-offer-category"
            required
            value={value.offerCategory}
            disabled={disabled}
            onChange={(event) =>
              patchDetails(value, onChange, {
                offerCategory: event.target
                  .value as HospitalityApplicationDetails["offerCategory"],
              })
            }
            className={`mt-1 ${inputClass}`}
          >
            <option value="">Select offer type</option>
            {HOSPITALITY_OFFER_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {HOSPITALITY_OFFER_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hospitality-redemption-cap" className={labelClass}>
            Redemption Cap <span className="text-primary">*</span>
          </label>
          <select
            id="hospitality-redemption-cap"
            value={value.redemptionCap}
            disabled
            className={`mt-1 ${inputClass} bg-surface text-muted-foreground`}
          >
            <option value="once_per_visit">{HOSPITALITY_REDEMPTION_CAP_LABEL}</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="hospitality-offer-title" className={labelClass}>
          Offer Title <span className="text-primary">*</span>
        </label>
        <input
          id="hospitality-offer-title"
          required
          value={value.offerTitle}
          disabled={disabled}
          onChange={(event) =>
            patchDetails(value, onChange, {
              offerTitle: capitalizeSentences(event.target.value),
            })
          }
          placeholder='e.g. "15% Off total bill"'
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="hospitality-offer-terms" className={labelClass}>
          Terms &amp; Conditions <span className="text-primary">*</span>
        </label>
        <textarea
          id="hospitality-offer-terms"
          required
          rows={4}
          value={value.offerTerms}
          disabled={disabled}
          onChange={(event) =>
            patchDetails(value, onChange, {
              offerTerms: capitalizeSentences(event.target.value),
            })
          }
          placeholder="e.g. Dine-in only, excludes alcohol."
          className={`mt-1 resize-y ${inputClass}`}
        />
      </div>
    </div>
  );
}
