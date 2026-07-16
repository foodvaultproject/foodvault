export const PRIMARY_DEPARTMENTS = [
  "Fruit & Veg",
  "Meat & Poultry",
  "Fish & Seafood",
  "Fridge & Deli",
  "Bakery",
  "Frozen",
  "Pantry",
  "Beer & Wine",
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
  "Beer & Wine": [
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

export function getSubcategoriesForDepartment(
  department: string
): readonly string[] {
  if (!department) return [];
  return (
    PARTNER_CATEGORY_TAXONOMY[department as PrimaryDepartment] ?? []
  );
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
};

export const MAX_TILE_DEPARTMENT_TAGS = 3;

export function emptyCategoryGroup(): PartnerCategoryGroup {
  return { department: "", subcategories: [] };
}

export function parseCategoryGroups(value: unknown): PartnerCategoryGroup[] {
  if (!Array.isArray(value)) return [];

  const groups: PartnerCategoryGroup[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const department = String(row.department ?? "");
    if (!isPrimaryDepartment(department)) continue;

    groups.push({
      department,
      subcategories: Array.isArray(row.subcategories)
        ? row.subcategories.filter(
            (subcategory): subcategory is string => typeof subcategory === "string"
          )
        : [],
    });
  }

  return groups;
}

export function categoryGroupsFromLegacy(
  primaryDepartment: string,
  subcategories: string[] = []
): PartnerCategoryGroup[] {
  if (!primaryDepartment || !isPrimaryDepartment(primaryDepartment)) {
    return [emptyCategoryGroup()];
  }

  return [{ department: primaryDepartment, subcategories }];
}

export function normalizeCategoryGroups(
  groups: PartnerCategoryGroup[]
): PartnerCategoryGroup[] {
  const normalized = groups
    .filter((group) => group.department)
    .map((group) => ({
      department: group.department,
      subcategories: [...new Set(group.subcategories)],
    }));

  return normalized.length > 0 ? normalized : [emptyCategoryGroup()];
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
  }));

  return {
    primaryDepartment,
    primary_category: primaryDepartment || null,
    subcategories: flattenSubcategories(normalized),
    primary_categories: getDepartmentsFromGroups(normalized),
    category_groups: storedGroups,
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
    const departments = row.primary_categories.filter(
      (value): value is PrimaryDepartment =>
        typeof value === "string" && isPrimaryDepartment(value)
    );
    if (departments.length > 0) {
      const subcategories = Array.isArray(row.subcategories)
        ? row.subcategories.filter(
            (value): value is string => typeof value === "string"
          )
        : [];

      if (departments.length === 1) {
        return [{ department: departments[0], subcategories }];
      }

      return departments.map((department) => ({
        department,
        subcategories: subcategories.filter((subcategory) =>
          getSubcategoriesForDepartment(department).includes(subcategory)
        ),
      }));
    }
  }

  const primaryDepartment =
    typeof row.primary_category === "string" ? row.primary_category : "";
  const subcategories = Array.isArray(row.subcategories)
    ? row.subcategories.filter((value): value is string => typeof value === "string")
    : [];

  return categoryGroupsFromLegacy(primaryDepartment, subcategories);
}
