import { addProductToCart } from "@/lib/commerce/cart";
import type { CartItem, FoodVaultProduct, GroceryListItem } from "@/types/commerce";

export const GROCERY_LIST_KEY = "foodvault_grocery_list";
export const GROCERY_LIST_CHANGE_EVENT = "fv:vault-market-grocery-change";
export const GROCERY_LIST_OPEN_EVENT = "fv:vault-market-grocery-open";

export function emitGroceryListOpen(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(GROCERY_LIST_OPEN_EVENT));
}

export function readGroceryList(): GroceryListItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(GROCERY_LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GroceryListItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function writeGroceryList(items: GroceryListItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GROCERY_LIST_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(GROCERY_LIST_CHANGE_EVENT));
}

export function isInGroceryList(items: GroceryListItem[], productId: string): boolean {
  return items.some((item) => item.product_id === productId);
}

export function toggleGroceryListItem(
  items: GroceryListItem[],
  product: FoodVaultProduct
): GroceryListItem[] {
  if (isInGroceryList(items, product.id)) {
    return items.filter((item) => item.product_id !== product.id);
  }

  return [
    ...items,
    {
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      member_price: product.member_price,
      retail_price: product.retail_price,
      image_url: product.image_url,
      quantity: 1,
      selected: true,
    },
  ];
}

export function setGroceryListQuantity(
  items: GroceryListItem[],
  productId: string,
  quantity: number
): GroceryListItem[] {
  const nextQty = Math.max(0, Math.trunc(quantity));
  if (nextQty <= 0) {
    return items.filter((item) => item.product_id !== productId);
  }
  return items.map((item) =>
    item.product_id === productId ? { ...item, quantity: nextQty } : item
  );
}

export function setGroceryListSelected(
  items: GroceryListItem[],
  productId: string,
  selected: boolean
): GroceryListItem[] {
  return items.map((item) =>
    item.product_id === productId ? { ...item, selected } : item
  );
}

export function removeGroceryListItem(
  items: GroceryListItem[],
  productId: string
): GroceryListItem[] {
  return items.filter((item) => item.product_id !== productId);
}

export function addGroceryItemsToCart(
  cart: CartItem[],
  groceryItems: GroceryListItem[],
  products: FoodVaultProduct[]
): CartItem[] {
  const selected = groceryItems.filter((item) => item.selected);
  return selected.reduce((nextCart, item) => {
    const product = products.find((entry) => entry.id === item.product_id);
    if (product) {
      return addProductToCart(nextCart, product, item.quantity);
    }

    const existing = nextCart.find((line) => line.product_id === item.product_id);
    if (existing) {
      return nextCart.map((line) =>
        line.product_id === item.product_id
          ? { ...line, quantity: line.quantity + item.quantity }
          : line
      );
    }

    return [
      ...nextCart,
      {
        product_id: item.product_id,
        sku: item.sku,
        name: item.name,
        brand: item.brand,
        member_price: item.member_price,
        retail_price: item.retail_price,
        image_url: item.image_url,
        quantity: item.quantity,
      },
    ];
  }, cart);
}
