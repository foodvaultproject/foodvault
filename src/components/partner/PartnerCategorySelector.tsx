"use client";

import {
  DIETARY_LIFESTYLE_ATTRIBUTES,
  emptyCategoryGroup,
  getDepartmentsFromGroups,
  getSubcategoriesForDepartment,
  groupShowsDietaryAttributes,
  normalizeDietaryLifestyleAttributes,
  PRIMARY_DEPARTMENTS,
  type PartnerCategoryGroup,
  type PrimaryDepartment,
} from "@/data/partner-categories";

import {
  portalCardTitle,
  portalHelper,
  portalLabel,
  portalSelect,
} from "@/lib/partner-portal-classes";

const selectClass = portalSelect;

type PartnerCategoriesEditorProps = {
  categoryGroups: PartnerCategoryGroup[];
  onChange: (groups: PartnerCategoryGroup[]) => void;
  idPrefix?: string;
  className?: string;
  disabled?: boolean;
  departmentLabel?: string;
  error?: string | null;
  compact?: boolean;
};

function updateGroupAtIndex(
  groups: PartnerCategoryGroup[],
  index: number,
  nextGroup: PartnerCategoryGroup
): PartnerCategoryGroup[] {
  return groups.map((group, groupIndex) =>
    groupIndex === index ? nextGroup : group
  );
}

export function PartnerCategoriesEditor({
  categoryGroups,
  onChange,
  idPrefix = "partner-category",
  className = "",
  disabled = false,
  departmentLabel = "Primary Department",
  error = null,
  compact = false,
}: PartnerCategoriesEditorProps) {
  const groups =
    categoryGroups.length > 0 ? categoryGroups : [emptyCategoryGroup()];
  const usedDepartments = getDepartmentsFromGroups(groups);

  function handleDepartmentChange(index: number, value: string) {
    const department = value as PrimaryDepartment | "";
    onChange(
      updateGroupAtIndex(groups, index, {
        department,
        subcategories: [],
        dietaryLifestyleAttributes: [],
      })
    );
  }

  function toggleSubcategory(index: number, subcategory: string) {
    const group = groups[index];
    if (!group) return;

    const nextSubcategories = group.subcategories.includes(subcategory)
      ? group.subcategories.filter((item) => item !== subcategory)
      : [...group.subcategories, subcategory];

    const nextGroup: PartnerCategoryGroup = {
      ...group,
      subcategories: nextSubcategories,
    };

    if (!groupShowsDietaryAttributes(nextGroup)) {
      nextGroup.dietaryLifestyleAttributes = [];
    }

    onChange(updateGroupAtIndex(groups, index, nextGroup));
  }

  function toggleDietaryAttribute(index: number, attribute: string) {
    if (disabled) return;

    const group = groups[index];
    if (!group || !groupShowsDietaryAttributes(group)) return;

    const current = normalizeDietaryLifestyleAttributes(
      group.dietaryLifestyleAttributes ?? []
    );
    const nextAttributes = current.includes(attribute)
      ? current.filter((item) => item !== attribute)
      : [...current, attribute];

    onChange(
      updateGroupAtIndex(groups, index, {
        ...group,
        dietaryLifestyleAttributes:
          normalizeDietaryLifestyleAttributes(nextAttributes),
      })
    );
  }

  function addDepartment() {
    onChange([...groups, emptyCategoryGroup()]);
  }

  function removeDepartment(index: number) {
    if (groups.length === 1) {
      onChange([emptyCategoryGroup()]);
      return;
    }

    onChange(groups.filter((_, groupIndex) => groupIndex !== index));
  }

  return (
    <div className={className}>
      {!compact ? (
        <p className={portalHelper}>
          Select every category and subcategory that applies to your products. This
          increases your visibility in FoodVault search and helps more members discover
          your brand.
        </p>
      ) : null}

      <div className={compact ? "space-y-4" : "mt-6 space-y-5"}>
        {groups.map((group, index) => {
          const availableSubcategories = getSubcategoriesForDepartment(group.department);
          const departmentOptions = PRIMARY_DEPARTMENTS.filter(
            (department) =>
              department === group.department ||
              !usedDepartments.includes(department)
          );
          const showDietaryAttributes = groupShowsDietaryAttributes(group);
          const normalizedDietaryAttributes = normalizeDietaryLifestyleAttributes(
            group.dietaryLifestyleAttributes ?? []
          );

          return (
            <div
              key={`${idPrefix}-group-${index}`}
              className={`rounded-lg border border-border bg-surface/50 ${compact ? "p-4" : "p-4 sm:p-5"}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <label
                    htmlFor={`${idPrefix}-department-${index}`}
                    className={portalLabel}
                  >
                    {departmentLabel} {index + 1}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`${idPrefix}-department-${index}`}
                    name={`primaryDepartment-${index}`}
                    required={index === 0}
                    disabled={disabled}
                    value={group.department}
                    onChange={(event) =>
                      handleDepartmentChange(index, event.target.value)
                    }
                    className={`mt-1.5 ${selectClass}`}
                  >
                    <option value="" disabled>
                      Select a primary department
                    </option>
                    {departmentOptions.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                {groups.length > 1 ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeDepartment(index)}
                    className="text-[0.8125rem] font-semibold text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              {group.department ? (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className={portalCardTitle}>{group.department} subcategories</h3>
                      <p className={`${portalHelper} mt-0.5`}>
                        Select all that apply. These become searchable tags on your
                        brand profile.
                      </p>
                    </div>
                    {group.subcategories.length > 0 ? (
                      <p className="text-sm font-medium text-primary">
                        {group.subcategories.length} selected
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {availableSubcategories.map((subcategory) => {
                      const checked = group.subcategories.includes(subcategory);
                      const inputId = `${idPrefix}-subcategory-${index}-${subcategory
                        .replace(/[^a-z0-9]+/gi, "-")
                        .toLowerCase()}`;

                      return (
                        <label
                          key={subcategory}
                          htmlFor={inputId}
                          className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-2.5 py-2 transition-colors ${
                            checked
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:border-primary/30"
                          }${disabled ? " cursor-not-allowed opacity-60" : ""}`}
                        >
                          <input
                            id={inputId}
                            type="checkbox"
                            name={`subcategories-${index}`}
                            value={subcategory}
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleSubcategory(index, subcategory)}
                            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-[0.8125rem] text-foreground">{subcategory}</span>
                        </label>
                      );
                    })}
                  </div>

                  {group.subcategories.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                      {group.subcategories.map((subcategory) => (
                        <span
                          key={subcategory}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {subcategory}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {showDietaryAttributes ? (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className={portalCardTitle}>
                        Attributes - Dietary &amp; Lifestyle
                      </h3>
                      <p className={`${portalHelper} mt-0.5`}>
                        Optional for {group.department}. Helps members find products that
                        match specific dietary and lifestyle preferences.
                      </p>
                    </div>
                    {normalizedDietaryAttributes.length > 0 ? (
                      <p className="text-sm font-medium text-primary">
                        {normalizedDietaryAttributes.length} selected
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {DIETARY_LIFESTYLE_ATTRIBUTES.map((attribute) => {
                      const checked = normalizedDietaryAttributes.includes(attribute);
                      const inputId = `${idPrefix}-dietary-${index}-${attribute
                        .replace(/[^a-z0-9]+/gi, "-")
                        .toLowerCase()}`;

                      return (
                        <label
                          key={attribute}
                          htmlFor={inputId}
                          className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-2.5 py-2 transition-colors ${
                            checked
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:border-primary/30"
                          }${disabled ? " cursor-not-allowed opacity-60" : ""}`}
                        >
                          <input
                            id={inputId}
                            type="checkbox"
                            name={`${idPrefix}-dietary-attributes-${index}`}
                            value={attribute}
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleDietaryAttribute(index, attribute)}
                            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-[0.8125rem] text-foreground">{attribute}</span>
                        </label>
                      );
                    })}
                  </div>

                  {normalizedDietaryAttributes.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                      {normalizedDietaryAttributes.map((attribute) => (
                        <span
                          key={attribute}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {attribute}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled || usedDepartments.length >= PRIMARY_DEPARTMENTS.length}
        onClick={addDepartment}
        className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-primary transition-colors hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span aria-hidden="true">+</span>
        Add another department
      </button>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

/** @deprecated Use PartnerCategoriesEditor instead. */
export const PartnerCategorySelector = PartnerCategoriesEditor;
