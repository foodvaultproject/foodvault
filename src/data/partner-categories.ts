export const PRIMARY_DEPARTMENTS = [
  "Fruit & Veg",
  "Meat & Poultry",
  "Fish & Seafood",
  "Fridge & Deli",
  "Bakery",
  "Frozen",
  "Pantry",
  "Beer, Wine & Liquor",
  "Drinks",
  "Health & Body",
  "Household",
  "Household Appliances",
  "Kitchenware",
  "Baby & Child",
  "Pet",
] as const;

export type PrimaryDepartment = (typeof PRIMARY_DEPARTMENTS)[number];

export const PARTNER_CATEGORY_TAXONOMY: Record<
  PrimaryDepartment,
  readonly string[]
> = {
  "Fruit & Veg": [
    "Fruit",
    "Vegetables",
    "Prepared Fruit & Veg",
    "Organic",
    "Fresh Deals",
    "Floral",
  ],
  "Meat & Poultry": [
    "Beef",
    "Chicken & Poultry",
    "Lamb",
    "Pork",
    "Venison & Game",
    "Mince & Patties",
    "Sausages",
    "BBQ Meat",
    "Roast Meat",
    "Offal & Bones",
    "Plant Based Alternatives",
  ],
  "Fish & Seafood": ["Fish", "Salmon", "Prawns & Seafood"],
  "Fridge & Deli": [
    "Eggs, Butter & Spreads",
    "Milk",
    "Cheese",
    "Yoghurt & Desserts",
    "Cream & Custard",
    "Juice & Drinks",
    "Deli Meats & Seafood",
    "Prepared Meals & Sides",
    "Deli Salads",
    "Pasta, Pizza & Pastry",
    "Dips, Hummus & Nibbles",
    "Vegan & Vegetarian",
  ],
  Bakery: [
    "Fresh Bread",
    "Artisan Bread",
    "Flatbreads",
    "Sliced & Packaged Bread",
    "Buns, Rolls & Bread Sticks",
    "Wraps, Pita & Pizza Bases",
    "Pastries, Croissants & Biscuits",
    "Cakes, Muffins & Desserts",
    "Bagels, Crumpets & Pancakes",
    "Bakery Treats",
    "Gluten Free",
    "Low Carb & Keto",
  ],
  Frozen: [
    "Frozen Vegetables",
    "Frozen Meat",
    "Frozen Meat Alternatives",
    "Frozen Seafood",
    "Frozen Fruit & Drink",
    "Frozen Meals & Snacks",
    "Pizza, Pastry & Bread",
    "Ice Cream & Sorbet",
    "Frozen Desserts",
  ],
  Pantry: [
    "Snacks & Sweets",
    "Biscuits & Crackers",
    "Tinned Foods & Packets",
    "Baking",
    "Cereals & Spreads",
    "Sauces & Pastes",
    "Pasta, Noodles & Grains",
    "Herbs, Spices & Stock",
    "Oil, Vinegar & Condiments",
    "Meal Kits",
    "International Foods",
    "Eggs",
    "Desserts",
    "Long Life Milk",
    "Bulk Foods",
  ],
  "Beer, Wine & Liquor": [
    "Beer",
    "Craft Beer",
    "Cider",
    "Champagne & Sparkling Wine",
    "Red Wine",
    "White Wine",
    "Rosé Wine",
    "Moscato & Sweet Wine",
    "Cask Wine",
    "Mini Wine Bottles & Cans",
    "Organic Wine",
    "Seltzer & Alcoholic Kombucha",
    "Lower Alcohol",
    "Non Alcoholic",
    "Spirits",
    "Whisky",
    "Vodka",
    "Gin",
    "Rum",
    "Tequila",
    "Mezcal",
    "Brandy",
    "Cognac",
    "Liqueurs",
    "Cocktails",
    "Ready-to-Drink (RTDs)",
    "Premixed Drinks",
    "Hard Seltzer",
    "Mead",
    "Sake",
    "Fortified Wine",
    "Aperitifs",
    "Digestifs",
    "Cocktail Mixers",
    "Tonics & Mixers",
    "Gift Packs",
    "Mixed Cases",
    "Limited Releases",
    "Premium Spirits",
    "Craft Spirits",
    "Imported Beverages",
  ],
  Drinks: [
    "Coffee",
    "Tea & Milk Drinks",
    "Soft Drinks & Sports Drinks",
    "Juice & Cordial",
    "Water",
    "Chilled Juice & Drinks",
  ],
  "Health & Body": [
    "Bath, Shower & Soap",
    "Hair Care",
    "Dental & Oral Care",
    "Deodorant & Body Sprays",
    "Skin Care & Sun Care",
    "Eye & Ear Care",
    "Shaving & Hair Removal",
    "Make Up & Nail Care",
    "Tissues & Cotton Wool",
    "Period & Continence Care",
    "Medical & First Aid",
    "Vitamins & Supplements",
    "Sports Nutrition & Weight Management",
    "Contraception & Pregnancy",
  ],
  Household: [
    "Bathroom",
    "Kitchen",
    "Laundry",
    "Cleaning",
    "Pest Control",
    "Homewares",
    "Bags",
    "Clothing & Accessories",
    "Garden & Garage",
    "Hardware & Electrical",
    "Entertainment & Gifts",
    "Magazines & Stationery",
  ],
  "Household Appliances": [
    "Air Care",
    "Cleaning Appliances",
    "Cooking Appliances",
    "Dishwashing",
    "Food Preparation",
    "Heating & Cooling",
    "Kitchen Appliances",
    "Laundry Appliances",
    "Refrigeration",
    "Smart Home Appliances",
    "Vacuum Cleaners",
    "Water Appliances",
    "Personal Care Appliances",
  ],
  Kitchenware: [
    "Bakeware",
    "Barware",
    "Cookware",
    "Cutlery & Knives",
    "Drinkware",
    "Food Storage",
    "Kitchen Gadgets",
    "Kitchen Organisation",
    "Kitchen Tools & Utensils",
    "Mixing & Preparation",
    "Servingware",
    "Tableware",
  ],
  "Baby & Child": [
    "Nappies & Wipes",
    "Baby Food",
    "Formula",
    "Bottles, Toys & Accessories",
    "For Mum",
  ],
  Pet: ["Cats", "Dogs", "Birds, Fish & Small Animals", "Pet Health & Accessories"],
};

export const DIETARY_LIFESTYLE_ATTRIBUTES = [
  "Gluten Free",
  "Dairy Free",
  "Egg Free",
  "Soy Free",
  "Nut Free",
  "Vegan",
  "Plant Based",
  "Vegetarian",
  "Organic",
  "Low Sugar",
  "No Added Sugar",
  "Keto Friendly",
  "Paleo Friendly",
  "High Protein",
  "High Fibre",
  "Low Carb",
  "Halal",
  "Kosher",
] as const;

export type DietaryLifestyleAttribute = (typeof DIETARY_LIFESTYLE_ATTRIBUTES)[number];

/** Departments that skip the dietary & lifestyle attributes step. */
export const DEPARTMENTS_WITHOUT_DIETARY_ATTRIBUTES = [
  "Fruit & Veg",
  "Fish & Seafood",
  "Household",
  "Household Appliances",
  "Kitchenware",
] as const satisfies readonly PrimaryDepartment[];

const DEPARTMENTS_WITHOUT_DIETARY_ATTRIBUTES_SET = new Set<string>(
  DEPARTMENTS_WITHOUT_DIETARY_ATTRIBUTES
);

export function departmentAllowsDietaryAttributes(
  department: string
): department is PrimaryDepartment {
  return (
    isPrimaryDepartment(department) &&
    !DEPARTMENTS_WITHOUT_DIETARY_ATTRIBUTES_SET.has(department)
  );
}

export function isDietaryLifestyleAttribute(
  value: string
): value is DietaryLifestyleAttribute {
  return (DIETARY_LIFESTYLE_ATTRIBUTES as readonly string[]).includes(value);
}

export function parseDietaryLifestyleAttributes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is DietaryLifestyleAttribute =>
      typeof item === "string" && isDietaryLifestyleAttribute(item)
  );
}

export function normalizeDietaryLifestyleAttributes(attributes: string[]): string[] {
  return DIETARY_LIFESTYLE_ATTRIBUTES.filter((attribute) =>
    attributes.includes(attribute)
  );
}

export function getSubcategoriesForDepartment(
  department: string
): readonly string[] {
  if (!department) return [];
  return (
    PARTNER_CATEGORY_TAXONOMY[department as PrimaryDepartment] ?? []
  );
}

const LEGACY_DEPARTMENT_ALIASES: Record<string, PrimaryDepartment> = {
  "Beer & Wine": "Beer, Wine & Liquor",
};

export function resolvePrimaryDepartment(value: string): PrimaryDepartment | null {
  if (PRIMARY_DEPARTMENTS.includes(value as PrimaryDepartment)) {
    return value as PrimaryDepartment;
  }
  return LEGACY_DEPARTMENT_ALIASES[value] ?? null;
}

export function isPrimaryDepartment(value: string): value is PrimaryDepartment {
  return PRIMARY_DEPARTMENTS.includes(value as PrimaryDepartment);
}

export type PartnerCategorySelection = {
  primaryDepartment: PrimaryDepartment | "";
  subcategories: string[];
};

export type PartnerCategoryGroup = {
  department: PrimaryDepartment | "";
  subcategories: string[];
  dietaryLifestyleAttributes?: string[];
};

export function hasSelectedSubcategories(groups: PartnerCategoryGroup[]): boolean {
  return groups.some((group) => group.subcategories.length > 0);
}

export function groupShowsDietaryAttributes(group: PartnerCategoryGroup): boolean {
  return (
    departmentAllowsDietaryAttributes(group.department) &&
    group.subcategories.length > 0
  );
}

export const MAX_TILE_DEPARTMENT_TAGS = 3;

export function emptyCategoryGroup(): PartnerCategoryGroup {
  return { department: "", subcategories: [], dietaryLifestyleAttributes: [] };
}

export function parseCategoryGroups(value: unknown): PartnerCategoryGroup[] {
  if (!Array.isArray(value)) return [];

  const groups: PartnerCategoryGroup[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const department = resolvePrimaryDepartment(String(row.department ?? ""));
    if (!department) continue;

    const nestedAttributes = normalizeDietaryLifestyleAttributes(
      parseDietaryLifestyleAttributes(row.dietaryLifestyleAttributes ?? row.dietary_lifestyle_attributes)
    );

    groups.push({
      department,
      subcategories: Array.isArray(row.subcategories)
        ? row.subcategories.filter(
            (subcategory): subcategory is string => typeof subcategory === "string"
          )
        : [],
      dietaryLifestyleAttributes: departmentAllowsDietaryAttributes(department)
        ? nestedAttributes
        : [],
    });
  }

  return groups;
}

export function categoryGroupsFromLegacy(
  primaryDepartment: string,
  subcategories: string[] = [],
  dietaryLifestyleAttributes: string[] = []
): PartnerCategoryGroup[] {
  const department = resolvePrimaryDepartment(primaryDepartment);
  if (!department) {
    return [emptyCategoryGroup()];
  }

  return [
    {
      department,
      subcategories,
      dietaryLifestyleAttributes: departmentAllowsDietaryAttributes(primaryDepartment)
        ? normalizeDietaryLifestyleAttributes(dietaryLifestyleAttributes)
        : [],
    },
  ];
}

export function normalizeCategoryGroups(
  groups: PartnerCategoryGroup[]
): PartnerCategoryGroup[] {
  const normalized = groups
    .filter((group) => group.department)
    .map((group) => ({
      department: group.department,
      subcategories: [...new Set(group.subcategories)],
      dietaryLifestyleAttributes: groupShowsDietaryAttributes({
        department: group.department,
        subcategories: [...new Set(group.subcategories)],
        dietaryLifestyleAttributes: group.dietaryLifestyleAttributes,
      })
        ? normalizeDietaryLifestyleAttributes(group.dietaryLifestyleAttributes ?? [])
        : [],
    }));

  return normalized.length > 0 ? normalized : [emptyCategoryGroup()];
}

export function flattenDietaryLifestyleAttributes(
  groups: PartnerCategoryGroup[]
): string[] {
  return normalizeDietaryLifestyleAttributes([
    ...new Set(
      normalizeCategoryGroups(groups).flatMap(
        (group) => group.dietaryLifestyleAttributes ?? []
      )
    ),
  ]);
}

/**
 * When loading legacy partner-level attributes, attach them to the first
 * eligible department group that already has subcategories (or the first
 * eligible department if none do). Nested per-group attributes win.
 */
export function hydrateCategoryGroupAttributes(
  groups: PartnerCategoryGroup[],
  partnerLevelAttributes: string[] = []
): PartnerCategoryGroup[] {
  const base =
    groups.length > 0
      ? groups.map((group) => ({
          ...group,
          dietaryLifestyleAttributes: normalizeDietaryLifestyleAttributes(
            group.dietaryLifestyleAttributes ?? []
          ),
        }))
      : [emptyCategoryGroup()];

  const hasNested = base.some(
    (group) => (group.dietaryLifestyleAttributes?.length ?? 0) > 0
  );
  if (hasNested) {
    return normalizeCategoryGroups(base);
  }

  const legacyAttributes = normalizeDietaryLifestyleAttributes(partnerLevelAttributes);
  if (legacyAttributes.length === 0) {
    return normalizeCategoryGroups(base);
  }

  const withSubcategories = base.findIndex(
    (group) =>
      departmentAllowsDietaryAttributes(group.department) &&
      group.subcategories.length > 0
  );
  const eligibleIndex =
    withSubcategories >= 0
      ? withSubcategories
      : base.findIndex((group) => departmentAllowsDietaryAttributes(group.department));

  if (eligibleIndex < 0) {
    return normalizeCategoryGroups(base);
  }

  return normalizeCategoryGroups(
    base.map((group, index) =>
      index === eligibleIndex
        ? { ...group, dietaryLifestyleAttributes: legacyAttributes }
        : group
    )
  );
}

export function getDepartmentsFromGroups(
  groups: PartnerCategoryGroup[]
): PrimaryDepartment[] {
  return normalizeCategoryGroups(groups)
    .map((group) => group.department)
    .filter(isPrimaryDepartment);
}

export function flattenSubcategories(groups: PartnerCategoryGroup[]): string[] {
  return [
    ...new Set(
      normalizeCategoryGroups(groups).flatMap((group) => group.subcategories)
    ),
  ];
}

export function tileDepartmentTags(departments: string[]): string[] {
  return departments.slice(0, MAX_TILE_DEPARTMENT_TAGS);
}

export function syncLegacyCategoryFields(groups: PartnerCategoryGroup[]) {
  const normalized = normalizeCategoryGroups(groups).filter(
    (group) => group.department
  );
  const primaryDepartment = normalized[0]?.department ?? "";
  const storedGroups = normalized.map((group) => ({
    department: group.department,
    subcategories: group.subcategories,
    dietaryLifestyleAttributes: group.dietaryLifestyleAttributes ?? [],
  }));

  return {
    primaryDepartment,
    primary_category: primaryDepartment || null,
    subcategories: flattenSubcategories(normalized),
    primary_categories: getDepartmentsFromGroups(normalized),
    category_groups: storedGroups,
    dietary_lifestyle_attributes: flattenDietaryLifestyleAttributes(normalized),
  };
}

export function validateCategoryGroups(groups: PartnerCategoryGroup[]): string | null {
  const normalized = normalizeCategoryGroups(groups).filter(
    (group) => group.department
  );

  if (normalized.length === 0) {
    return "Select at least one primary department.";
  }

  for (const group of normalized) {
    if (group.subcategories.length === 0) {
      return `Select at least one subcategory for ${group.department}.`;
    }
  }

  return null;
}

export function resolveCategoryGroupsFromRecord(row: {
  category_groups?: unknown;
  primary_category?: unknown;
  primary_categories?: unknown;
  subcategories?: unknown;
}): PartnerCategoryGroup[] {
  const parsedGroups = parseCategoryGroups(row.category_groups);
  if (parsedGroups.length > 0) {
    return parsedGroups;
  }

  if (Array.isArray(row.primary_categories)) {
    const departments = row.primary_categories
      .map((value) =>
        typeof value === "string" ? resolvePrimaryDepartment(value) : null
      )
      .filter((value): value is PrimaryDepartment => value !== null);
    if (departments.length > 0) {
      const subcategories = Array.isArray(row.subcategories)
        ? row.subcategories.filter(
            (value): value is string => typeof value === "string"
          )
        : [];

      if (departments.length === 1) {
        return [
          {
            department: departments[0],
            subcategories,
            dietaryLifestyleAttributes: [],
          },
        ];
      }

      return departments.map((department) => ({
        department,
        subcategories: subcategories.filter((subcategory) =>
          getSubcategoriesForDepartment(department).includes(subcategory)
        ),
        dietaryLifestyleAttributes: [],
      }));
    }
  }

  const primaryDepartment =
    typeof row.primary_category === "string"
      ? resolvePrimaryDepartment(row.primary_category) ?? ""
      : "";
  const subcategories = Array.isArray(row.subcategories)
    ? row.subcategories.filter((value): value is string => typeof value === "string")
    : [];

  return categoryGroupsFromLegacy(primaryDepartment, subcategories);
}
