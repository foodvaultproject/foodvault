import { formatNzPrice } from "@/lib/partner-offer";
import type {
  FoodVaultNutritionFacts,
  FoodVaultProduct,
  FoodVaultUnitPricing,
} from "@/types/commerce";

export const NIP_NUTRIENTS = [
  { key: "energy_kj", label: "Energy (kJ)" },
  { key: "energy_kcal", label: "Energy (kcal)" },
  { key: "protein", label: "Protein (g)" },
  { key: "fat_total", label: "Fat, total (g)" },
  { key: "fat_saturated", label: "Saturated fat (g)" },
  { key: "carbs", label: "Carbohydrate (g)" },
  { key: "sugars", label: "Sugars (g)" },
  { key: "sodium", label: "Sodium (mg)" },
] as const;

export type NipNutrientKey = (typeof NIP_NUTRIENTS)[number]["key"];

export type NipMatrix = {
  serving_size: string;
  servings_per_pack: string;
  values: Record<NipNutrientKey, { per_serve: string; per_100g: string }>;
};

export type StockOnHandRow = {
  product_id: string;
  sku: string;
  name: string;
  soh: number;
  unit_cost_price: number;
  wholesale_value: number;
  retail_value: number;
};

export type SlowMovingRow = {
  product_id: string;
  sku: string;
  name: string;
  stock_quantity: number;
  units_sold_30d: number;
};

export type ExpiryWarningRow = {
  batch_id: string;
  product_id: string;
  sku: string;
  name: string;
  batch_number: string;
  quantity_received: number;
  expiry_date: string;
  days_until_expiry: number;
};

export type PantryReportData = {
  soh: StockOnHandRow[];
  sohTotals: { wholesale: number; retail: number; units: number };
  slowMoving: SlowMovingRow[];
  expiry: ExpiryWarningRow[];
};

export function emptyNipMatrix(): NipMatrix {
  return {
    serving_size: "",
    servings_per_pack: "",
    values: NIP_NUTRIENTS.reduce(
      (acc, nutrient) => {
        acc[nutrient.key] = { per_serve: "", per_100g: "" };
        return acc;
      },
      {} as NipMatrix["values"]
    ),
  };
}

export function nipFromFacts(facts?: FoodVaultNutritionFacts | null): NipMatrix {
  const next = emptyNipMatrix();
  if (!facts) return next;
  next.serving_size = facts.serving_size ?? "";
  next.servings_per_pack = facts.servings_per_pack ?? "";
  for (const nutrient of NIP_NUTRIENTS) {
    const row = facts.rows.find((entry) => entry.label === nutrient.label);
    if (row) {
      next.values[nutrient.key] = {
        per_serve: row.per_serve,
        per_100g: row.per_100g,
      };
    }
  }
  return next;
}

export function factsFromNip(nip: NipMatrix): FoodVaultNutritionFacts | null {
  const rows = NIP_NUTRIENTS.map((nutrient) => ({
    label: nutrient.label,
    per_serve: nip.values[nutrient.key]?.per_serve?.trim() || "—",
    per_100g: nip.values[nutrient.key]?.per_100g?.trim() || "—",
  }));
  const hasValues = rows.some((row) => row.per_serve !== "—" || row.per_100g !== "—");
  if (!hasValues && !nip.serving_size.trim() && !nip.servings_per_pack.trim()) {
    return null;
  }
  return {
    serving_size: nip.serving_size.trim() || "—",
    servings_per_pack: nip.servings_per_pack.trim() || "—",
    rows,
  };
}

export function parseUnitPriceLabel(label: string): FoodVaultUnitPricing | null {
  const match = label.trim().match(/^\$?\s*(\d+(?:\.\d+)?)\s*\/\s*(.+)$/);
  if (!match) return null;
  return { price: Number(match[1]), basis: match[2].trim() };
}

export function unitPriceLabelFromProduct(product: FoodVaultProduct): string {
  if (product.unit_price_label?.trim()) return product.unit_price_label.trim();
  if (product.unit_pricing) {
    return `${formatNzPrice(product.unit_pricing.price)} / ${product.unit_pricing.basis}`;
  }
  return "";
}
