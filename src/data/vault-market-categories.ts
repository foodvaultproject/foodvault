export const VAULT_MARKET_DEPARTMENTS = [
  "Pantry",
  "Beer & Wine",
  "Drinks",
  "Household",
  "Baby & Child",
  "Pet",
] as const;

export type VaultMarketDepartment = (typeof VAULT_MARKET_DEPARTMENTS)[number];

export type VaultMarketSubcategory = {
  label: string;
  specifics: readonly string[];
};

export type VaultMarketDepartmentNode = {
  department: VaultMarketDepartment;
  subcategories: readonly VaultMarketSubcategory[];
};

export const VAULT_MARKET_TAXONOMY: readonly VaultMarketDepartmentNode[] = [
  {
    department: "Pantry",
    subcategories: [
      {
        label: "Baking",
        specifics: [
          "Flour",
          "Sugar",
          "Baking powder/soda",
          "Cocoa",
          "Chocolate chips",
          "Baking mixes",
          "Yeast",
          "Icing",
          "Food colouring",
        ],
      },
      {
        label: "Biscuits & Crackers",
        specifics: [
          "Sweet biscuits",
          "Savoury crackers",
          "Rice crackers",
          "Cookies",
          "Digestives",
        ],
      },
      {
        label: "Cereals & Spreads",
        specifics: ["Breakfast cereals", "Muesli", "Oats", "Porridge", "Spreads"],
      },
      {
        label: "Desserts",
        specifics: ["Jelly & Fruit Cups", "Custard powder", "Instant puddings", "Dessert mixes"],
      },
      {
        label: "Eggs",
        specifics: ["Long-life / specialty eggs"],
      },
      {
        label: "Herbs, Spices & Stock",
        specifics: [
          "Dried herbs",
          "Ground spices",
          "Spice blends",
          "Stock cubes/liquids",
          "Gravy mixes",
        ],
      },
      {
        label: "International Foods",
        specifics: [
          "Asian",
          "Indian",
          "Mexican",
          "Middle Eastern",
          "European specialty ingredients & sauces",
        ],
      },
      {
        label: "Long Life Milk",
        specifics: ["UHT dairy milk", "Plant-based long-life milks"],
      },
      {
        label: "Oil, Vinegar & Condiments",
        specifics: [
          "Cooking oils",
          "Olive oil",
          "Vinegars",
          "Mayonnaise",
          "Mustard",
          "Dressings",
          "Tomato sauce",
          "Hot sauce",
        ],
      },
      {
        label: "Pasta, Noodles & Grains",
        specifics: [
          "Dried pasta",
          "Instant noodles",
          "Rice",
          "Couscous",
          "Quinoa",
          "Other grains",
        ],
      },
      {
        label: "Sauces & Pastes",
        specifics: [
          "Pasta sauces",
          "Stir-fry sauces",
          "Curry pastes",
          "Marinades",
          "Tomato paste",
          "Cooking sauces",
        ],
      },
      {
        label: "Snacks & Sweets",
        specifics: [
          "Chocolate Bars & Blocks",
          "Chips",
          "Muesli Bars & Snack Bars",
          "Gums & Mints",
          "Lollies & Sweets",
          "Nuts & Seeds",
          "Popcorn",
        ],
      },
      {
        label: "Tinned Foods & Packets",
        specifics: [
          "Tinned Fruit",
          "Tinned Vegetables",
          "Beans & Legumes",
          "Soups",
          "Tinned Fish",
          "Packet mixes & dips",
        ],
      },
    ],
  },
  {
    department: "Beer & Wine",
    subcategories: [
      { label: "Beer", specifics: ["Lager", "Ale", "Pilsner", "Stout"] },
      { label: "Cask Wine", specifics: ["Cask / bag-in-box / bagnum wines"] },
      {
        label: "Champagne & Sparkling Wine",
        specifics: ["Champagne", "Prosecco", "Méthode traditionnelle", "Sparkling"],
      },
      { label: "Cider", specifics: ["Apple", "Pear", "Flavoured ciders"] },
      { label: "Craft Beer", specifics: ["Craft and specialty beers"] },
      { label: "Lower Alcohol", specifics: ["Lower / reduced alcohol beer, wine and cider"] },
      { label: "Moscato & Sweet Wine", specifics: ["Moscato", "Sweet / aromatic wines"] },
      { label: "Non Alcoholic", specifics: ["Non-alcoholic beer", "Non-alcoholic wine and alternatives"] },
      { label: "Organic Wine", specifics: ["Organic and biodynamic wines"] },
      {
        label: "Red Wine",
        specifics: ["Cabernet", "Shiraz", "Merlot", "Pinot Noir", "Blends"],
      },
      { label: "Rosé Wine", specifics: ["Rosé wines"] },
      {
        label: "Seltzer & Alcoholic Kombucha",
        specifics: ["Hard seltzers", "Alcoholic kombucha", "RTDs"],
      },
      {
        label: "White Wine",
        specifics: ["Sauvignon Blanc", "Chardonnay", "Pinot Gris", "Riesling", "Sweet & Aromatics"],
      },
    ],
  },
  {
    department: "Drinks",
    subcategories: [
      { label: "Chilled Juice & Drinks", specifics: ["Chilled juices", "Smoothies", "Kombucha"] },
      {
        label: "Coffee",
        specifics: [
          "Ground coffee",
          "Instant coffee",
          "Coffee pods",
          "Coffee beans",
          "Coffee mixes / sachets",
        ],
      },
      {
        label: "Juice & Cordial",
        specifics: ["Shelf-stable juice", "Cordial", "Squash", "Fruit drinks"],
      },
      {
        label: "Soft Drinks & Sports Drinks",
        specifics: ["Soft drinks", "Energy Drinks", "Sports drinks", "Mixers"],
      },
      {
        label: "Tea & Milk Drinks",
        specifics: ["Tea bags", "Loose leaf tea", "Hot chocolate", "Milk drink mixes"],
      },
      { label: "Water", specifics: ["Still water", "Sparkling water", "Flavoured water"] },
    ],
  },
  {
    department: "Household",
    subcategories: [
      {
        label: "Bags",
        specifics: ["Bin bags / kitchen tidy liners", "Storage bags", "Sandwich bags", "Shopping bags"],
      },
      { label: "Bathroom", specifics: ["Bathroom cleaners", "Toilet cleaners", "Bathroom accessories"] },
      {
        label: "Cleaning",
        specifics: [
          "Kitchen Cleaners",
          "Multipurpose cleaners",
          "Disinfectants",
          "Surface sprays",
          "Floor cleaners",
          "Oven cleaners",
        ],
      },
      {
        label: "Entertainment & Gifts",
        specifics: ["Entertainment items", "Novelty gifts", "Cards", "Decorations"],
      },
      {
        label: "Garden & Garage",
        specifics: [
          "Garden tools",
          "Fertilisers",
          "Weed killers",
          "Car care products",
          "Outdoor / BBQ accessories",
        ],
      },
      {
        label: "Hardware & Electrical",
        specifics: ["Batteries", "Light bulbs", "Basic tools", "Electrical accessories", "Tape", "Glue"],
      },
      { label: "Homewares", specifics: ["Kitchenware", "Storage containers", "Home accessories"] },
      {
        label: "Kitchen",
        specifics: [
          "Dishwashing liquid & tablets",
          "Kitchen paper / paper towels",
          "Cling film",
          "Foil",
          "Baking paper",
          "Food storage",
        ],
      },
      {
        label: "Laundry",
        specifics: ["Laundry detergent", "Fabric softener", "Stain removers", "Bleach", "Laundry accessories"],
      },
      {
        label: "Pest Control",
        specifics: ["Insect sprays", "Baits", "Traps", "Pest prevention products"],
      },
    ],
  },
  {
    department: "Baby & Child",
    subcategories: [
      {
        label: "Baby Food",
        specifics: ["Jars", "Pouches", "Baby & Toddler Snacks", "Stage-based foods"],
      },
      {
        label: "Bottles, Toys & Accessories",
        specifics: ["Bottles", "Teats", "Teething products", "Toys", "Feeding accessories", "Dummies"],
      },
      { label: "For Mum", specifics: ["Maternity", "Nursing", "Pregnancy-related products"] },
      {
        label: "Formula",
        specifics: ["Newborn (0-6m)", "Toddler (12m+)", "Specialty formulas"],
      },
      {
        label: "Nappies & Wipes",
        specifics: ["Nappy pants", "Baby wipes", "Changing accessories"],
      },
    ],
  },
  {
    department: "Pet",
    subcategories: [
      {
        label: "Birds, Fish & Small Animals",
        specifics: ["Bird food & accessories", "Fish Food & Accessories", "Small animal food & accessories"],
      },
      {
        label: "Cats",
        specifics: ["Dry Cat Food", "Wet Cat Food", "Cat treats", "Litter", "Accessories", "Kitten products"],
      },
      {
        label: "Dogs",
        specifics: ["Dry Dog Food", "Wet Dog Food / Dog roll", "Dog treats", "Accessories"],
      },
      {
        label: "Pet Health & Accessories",
        specifics: ["Pet Health & Treatments", "General health supplements", "Toys, leads, beds, collars"],
      },
    ],
  },
] as const;

const DEPARTMENT_ALIASES: Record<string, VaultMarketDepartment> = {
  "Beer, Wine & Liquor": "Beer & Wine",
  "Beer Wine & Liquor": "Beer & Wine",
};

export function isVaultMarketDepartment(value: string): value is VaultMarketDepartment {
  return (VAULT_MARKET_DEPARTMENTS as readonly string[]).includes(value);
}

export function getVaultMarketDepartmentNode(
  department: string
): VaultMarketDepartmentNode | undefined {
  const resolved = DEPARTMENT_ALIASES[department] ?? department;
  return VAULT_MARKET_TAXONOMY.find((entry) => entry.department === resolved);
}

export function getVaultMarketSubcategories(department: string): readonly string[] {
  return getVaultMarketDepartmentNode(department)?.subcategories.map((entry) => entry.label) ?? [];
}

export function getVaultMarketSpecifics(
  department: string,
  subcategory: string
): readonly string[] {
  const node = getVaultMarketDepartmentNode(department);
  return (
    node?.subcategories.find((entry) => entry.label === subcategory)?.specifics ?? []
  );
}
