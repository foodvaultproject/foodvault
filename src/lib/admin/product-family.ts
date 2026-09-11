import { emptyNipMatrix, type NipMatrix } from "@/lib/admin/pantry-shared";

export type ProductFamilyVariantInput = {
  id?: string;
  name: string;
  sku: string;
  barcode: string;
  slug: string;
  description: string;
  ingredients: string;
  allergens: string;
  nip: NipMatrix;
  image_url: string;
  gallery_urls: string[];
};

export type ProductFamilySaveInput = {
  product_family_id?: string | null;
  brand: string;
  category: string;
  subcategory: string;
  retail_price: number;
  member_price: number;
  wholesale_cost: number;
  vendor_id: string;
  unit_price_label: string;
  unit_kind: "solid" | "liquid";
  pack_amount: number;
  origin_label: string;
  bin_location: string;
  health_star_rating: number | null;
  natural_flavours_or_colours: boolean;
  is_active: boolean;
  is_multibuy: boolean;
  multibuy_quantity: number;
  multibuy_price: number;
  variants: ProductFamilyVariantInput[];
};

export type ProductVariantDraft = ProductFamilyVariantInput & {
  key: string;
  slugTouched: boolean;
  nipText: string;
};

export function emptyVariantDraft(key = crypto.randomUUID()): ProductVariantDraft {
  return {
    key,
    name: "",
    sku: "",
    barcode: "",
    slug: "",
    slugTouched: false,
    description: "",
    ingredients: "",
    allergens: "",
    nip: emptyNipMatrix(),
    nipText: "",
    image_url: "",
    gallery_urls: [],
  };
}

export function variantTabLabel(variant: ProductVariantDraft, index: number): string {
  const name = variant.name.trim();
  if (!name) return `Variant ${index + 1}`;
  return name.length > 28 ? `${name.slice(0, 26)}…` : name;
}

export function validateProductFamilyInput(input: ProductFamilySaveInput): string | null {
  if (!input.brand.trim()) return "Brand is required.";
  if (!input.category.trim()) return "Category is required.";
  if (!Number.isFinite(input.retail_price) || input.retail_price < 0) {
    return "Retail price is required.";
  }
  if (!Number.isFinite(input.member_price) || input.member_price < 0) {
    return "Member price is required.";
  }
  if (input.is_multibuy) {
    if (!Number.isInteger(input.multibuy_quantity) || input.multibuy_quantity < 2) {
      return "Multi-buy quantity must be at least 2.";
    }
    if (!Number.isFinite(input.multibuy_price) || input.multibuy_price <= 0) {
      return "Multi-buy total price is required.";
    }
  }
  if (input.variants.length < 1) return "Add at least one variant.";

  const skus = new Set<string>();
  for (let index = 0; index < input.variants.length; index += 1) {
    const variant = input.variants[index];
    const label = variant.name.trim() || `Variant ${index + 1}`;
    if (!variant.name.trim()) return `${label}: product name is required.`;
    if (!variant.sku.trim()) return `${label}: SKU is required.`;
    const skuKey = variant.sku.trim().toLowerCase();
    if (skus.has(skuKey)) {
      return `SKU “${variant.sku.trim()}” is used on more than one variant.`;
    }
    skus.add(skuKey);
  }
  return null;
}
