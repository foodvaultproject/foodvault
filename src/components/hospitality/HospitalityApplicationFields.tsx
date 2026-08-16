"use client";

import { AddressAutocomplete } from "@/components/hospitality/AddressAutocomplete";
import {
  HOSPITALITY_OFFER_CATEGORY_LABELS,
  HOSPITALITY_REDEMPTION_CAP_LABEL,
  HOSPITALITY_VENUE_TYPE_LABELS,
} from "@/lib/hospitality/constants";
import {
  HOSPITALITY_OFFER_CATEGORIES,
  HOSPITALITY_VENUE_TYPES,
  type HospitalityApplicationDetails,
} from "@/lib/hospitality/types";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "text-sm font-bold text-foreground";

type HospitalityApplicationFieldsProps = {
  value: HospitalityApplicationDetails;
  onChange: (value: HospitalityApplicationDetails) => void;
  disabled?: boolean;
};

export function HospitalityApplicationFields({
  value,
  onChange,
  disabled = false,
}: HospitalityApplicationFieldsProps) {
  function patch(partial: Partial<HospitalityApplicationDetails>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="hospitality-venue-type" className={labelClass}>
          Venue type
        </label>
        <select
          id="hospitality-venue-type"
          value={value.venueType}
          disabled={disabled}
          onChange={(event) =>
            patch({
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

      <AddressAutocomplete
        value={value.location}
        onChange={(location) => patch({ location })}
        disabled={disabled}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="hospitality-hours" className={labelClass}>
            Opening hours
          </label>
          <input
            id="hospitality-hours"
            value={value.openingHours}
            disabled={disabled}
            onChange={(event) => patch({ openingHours: event.target.value })}
            placeholder="e.g. Mon–Fri 7:00am–3:00pm"
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="hospitality-phone" className={labelClass}>
            Venue phone
          </label>
          <input
            id="hospitality-phone"
            type="tel"
            value={value.phone}
            disabled={disabled}
            onChange={(event) => patch({ phone: event.target.value })}
            placeholder="e.g. 04 555 0121"
            className={`mt-1 ${inputClass}`}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="hospitality-offer-category" className={labelClass}>
            Offer category
          </label>
          <select
            id="hospitality-offer-category"
            value={value.offerCategory}
            disabled={disabled}
            onChange={(event) =>
              patch({
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
            Redemption cap
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
          Offer title
        </label>
        <input
          id="hospitality-offer-title"
          value={value.offerTitle}
          disabled={disabled}
          onChange={(event) => patch({ offerTitle: event.target.value })}
          placeholder='e.g. "15% Off Total Bill"'
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="hospitality-offer-terms" className={labelClass}>
          Terms &amp; conditions
        </label>
        <textarea
          id="hospitality-offer-terms"
          rows={4}
          value={value.offerTerms}
          disabled={disabled}
          onChange={(event) => patch({ offerTerms: event.target.value })}
          placeholder="e.g. Dine-in only, excludes alcohol."
          className={`mt-1 resize-y ${inputClass}`}
        />
      </div>
    </div>
  );
}
