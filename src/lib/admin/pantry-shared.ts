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

export const NZ_GST_RATE = 0.15;

export function memberPriceExGst(memberPriceIncGst: number): number {
  return memberPriceIncGst / (1 + NZ_GST_RATE);
}

export function calcGrossProfit(memberPriceIncGst: number, wholesaleExGst: number) {
  if (!Number.isFinite(memberPriceIncGst) || memberPriceIncGst <= 0) {
    return { exGst: null as number | null, profit: null as number | null, margin: null as number | null };
  }
  const cost = Number.isFinite(wholesaleExGst) ? wholesaleExGst : 0;
  const exGst = memberPriceExGst(memberPriceIncGst);
  const profit = exGst - cost;
  const margin = exGst > 0 ? (profit / exGst) * 100 : null;
  return { exGst, profit, margin };
}

export function calcMultibuyGrossProfit(
  multibuyPriceIncGst: number,
  wholesaleExGst: number,
  quantity: number
) {
  if (!Number.isFinite(multibuyPriceIncGst) || multibuyPriceIncGst <= 0 || !(quantity > 0)) {
    return { exGst: null as number | null, profit: null as number | null, margin: null as number | null };
  }
  const cost = (Number.isFinite(wholesaleExGst) ? wholesaleExGst : 0) * quantity;
  const exGst = memberPriceExGst(multibuyPriceIncGst);
  const profit = exGst - cost;
  const margin = exGst > 0 ? (profit / exGst) * 100 : null;
  return { exGst, profit, margin };
}

export const MULTIBUY_SAVE_BLOCKED_MESSAGE = "Fix invalid Multi-Buy pricing before saving.";

function moneyCents(value: number): number {
  return Math.round(value * 100);
}

export function memberBundleTotal(memberPrice: number, quantity: number): number {
  return memberPrice * quantity;
}

export function maxAllowedMultibuyPrice(memberPrice: number, quantity: number): number {
  return memberBundleTotal(memberPrice, quantity) - 0.01;
}

/** True when a multi-buy total is not strictly cheaper than buying that quantity at member price. */
export function isMultibuyPriceAtOrAboveMemberTotal(
  memberPrice: number,
  quantity: number,
  multibuyPrice: number
): boolean {
  if (!Number.isFinite(memberPrice) || !Number.isFinite(quantity) || !Number.isFinite(multibuyPrice)) {
    return false;
  }
  const qty = Math.trunc(quantity);
  if (qty < 2 || memberPrice <= 0 || multibuyPrice <= 0) return false;
  return moneyCents(multibuyPrice) >= moneyCents(memberPrice) * qty;
}

export function invalidMultibuyPriceMessage(memberPrice: number, quantity: number): string {
  return `Invalid Multi-Buy Price: Total must be less than the standard Member Price total ($${memberBundleTotal(memberPrice, quantity).toFixed(2)}).`;
}

export function multibuyPricingIssue(input: {
  is_multibuy: boolean;
  member_price: number;
  multibuy_quantity: number;
  multibuy_price: number;
}): string | null {
  if (!input.is_multibuy) return null;
  if (!Number.isInteger(input.multibuy_quantity) || input.multibuy_quantity < 2) {
    return "Multi-buy quantity must be at least 2.";
  }
  if (!Number.isFinite(input.multibuy_price) || input.multibuy_price <= 0) {
    return "Multi-buy total price is required.";
  }
  if (
    isMultibuyPriceAtOrAboveMemberTotal(
      input.member_price,
      input.multibuy_quantity,
      input.multibuy_price
    )
  ) {
    return invalidMultibuyPriceMessage(input.member_price, input.multibuy_quantity);
  }
  return null;
}

export type UnitKind = "solid" | "liquid";

export function buildUnitPricing(
  memberPrice: number,
  kind: UnitKind,
  packAmount: number
): FoodVaultUnitPricing | null {
  if (!(memberPrice > 0) || !(packAmount > 0)) return null;
  if (kind === "solid") {
    return {
      price: memberPrice / (packAmount / 100),
      basis: "100g",
      pack_amount: packAmount,
      kind,
    };
  }
  return {
    price: memberPrice / packAmount,
    basis: "1L",
    pack_amount: packAmount,
    kind,
  };
}

export function formatAutoUnitPriceLabel(
  memberPrice: number,
  kind: UnitKind,
  packAmount: number
): string {
  const unit = buildUnitPricing(memberPrice, kind, packAmount);
  if (!unit) return "";
  return `${formatNzPrice(unit.price)} / ${unit.basis}`;
}

export function inferUnitKind(product?: FoodVaultProduct | null): UnitKind {
  const stored = product?.unit_pricing?.kind;
  if (stored === "liquid" || stored === "solid") return stored;
  const basis = `${product?.unit_pricing?.basis ?? ""} ${product?.unit_price_label ?? ""}`.toLowerCase();
  if (/\b1\s*l\b|\blitre|\bliter|\bml\b/.test(basis)) return "liquid";
  const name = product?.name ?? "";
  if (/\d+(?:\.\d+)?\s*ml\b/i.test(name) || /\d+(?:\.\d+)?\s*l\b/i.test(name)) {
    if (!/\d+(?:\.\d+)?\s*g\b/i.test(name)) return "liquid";
  }
  return "solid";
}

export function inferPackAmount(product?: FoodVaultProduct | null, kind?: UnitKind): string {
  const resolved = kind ?? inferUnitKind(product);
  const stored = product?.unit_pricing?.pack_amount;
  if (stored && stored > 0) return String(stored);
  if (resolved === "solid" && product?.net_weight_g && product.net_weight_g > 0) {
    return String(product.net_weight_g);
  }
  const name = product?.name ?? "";
  if (resolved === "solid") {
    return name.match(/(\d+(?:\.\d+)?)\s*g\b/i)?.[1] ?? "";
  }
  const litres = name.match(/(\d+(?:\.\d+)?)\s*l\b/i)?.[1];
  if (litres) return litres;
  const ml = name.match(/(\d+(?:\.\d+)?)\s*ml\b/i)?.[1];
  return ml ? String(Number(ml) / 1000) : "";
}
