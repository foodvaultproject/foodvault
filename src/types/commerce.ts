export type FoodVaultOrderStatus =
  | "pending"
  | "paid"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export type FoodVaultUnitKind = "solid" | "liquid";

export interface FoodVaultUnitPricing {
  price: number;
  basis: string;
  pack_amount?: number;
  kind?: FoodVaultUnitKind;
}

export interface FoodVaultNutritionRow {
  label: string;
  per_serve: string;
  per_100g: string;
}

export interface FoodVaultNutritionFacts {
  serving_size: string;
  servings_per_pack: string;
  rows: FoodVaultNutritionRow[];
}

/** Catalog row from `foodvault_products`. */
export interface FoodVaultProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  retail_price: number;
  member_price: number;
  stock_quantity: number;
  category: string;
  subcategory?: string | null;
  slug?: string | null;
  image_url: string | null;
  gallery_urls?: string[];
  is_active: boolean;
  description?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  nutrition_facts?: FoodVaultNutritionFacts | null;
  origin_label?: string | null;
  unit_pricing?: FoodVaultUnitPricing | null;
  unit_price_label?: string | null;
  net_weight_g?: number | null;
  health_star_rating?: number | null;
  natural_flavours_or_colours?: boolean | null;
  bin_location?: string | null;
  barcode?: string | null;
  vendor_id?: string | null;
  wholesale_cost?: number | null;
  product_family_id?: string | null;
  is_multibuy?: boolean;
  multibuy_quantity?: number | null;
  multibuy_price?: number | null;
  created_at?: string;
  updated_at?: string | null;
}

/** Stock intake row from `foodvault_inventory_batches`. */
export interface FoodVaultInventoryBatch {
  id: string;
  product_id: string;
  quantity_received: number;
  unit_cost_price: number;
  batch_number: string;
  expiry_date: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface GroceryListItem {
  product_id: string;
  sku: string;
  name: string;
  brand: string;
  member_price: number;
  retail_price: number;
  image_url: string | null;
  quantity: number;
  selected: boolean;
}

/** Line item snapshot stored on `foodvault_order_items`. */
export interface FoodVaultOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface FoodVaultShippingAddress {
  name: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

/** Order header from `foodvault_orders`. */
export interface FoodVaultOrder {
  id: string;
  member_id: string | null;
  status: FoodVaultOrderStatus;
  subtotal: number;
  total: number;
  currency: string;
  stripe_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  total_savings?: number;
  shipping?: FoodVaultShippingAddress | null;
  tracking_number?: string | null;
  fulfilled_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  items?: FoodVaultOrderItem[];
}

/** Client cart line for Vault Market. */
export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  brand: string;
  member_price: number;
  retail_price: number;
  image_url: string | null;
  quantity: number;
}
