import type { CartItem, FoodVaultProduct } from "@/types/commerce";

export const VAULT_MARKET_CART_KEY = "fv.vault-market.cart";
export const VAULT_MARKET_CART_CHANGE_EVENT = "fv:vault-market-cart-change";
export const VAULT_MARKET_CART_OPEN_EVENT = "fv:vault-market-cart-open";
export const VAULT_MARKET_OPEN_CART_FLAG = "fv.vault-market.open-cart";

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartMemberSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.member_price * item.quantity, 0);
}

export function cartMemberSavings(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const perUnit = Math.max(0, item.retail_price - item.member_price);
    return sum + perUnit * item.quantity;
  }, 0);
}

export function emitVaultMarketCartOpen(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(VAULT_MARKET_CART_OPEN_EVENT));
}

export function requestVaultMarketCartOpen(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(VAULT_MARKET_OPEN_CART_FLAG, "1");
  emitVaultMarketCartOpen();
}

export function consumeVaultMarketCartOpenFlag(): boolean {
  if (typeof window === "undefined") return false;
  const flagged = window.sessionStorage.getItem(VAULT_MARKET_OPEN_CART_FLAG) === "1";
  if (flagged) window.sessionStorage.removeItem(VAULT_MARKET_OPEN_CART_FLAG);
  return flagged;
}

export function readVaultMarketCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(VAULT_MARKET_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function writeVaultMarketCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VAULT_MARKET_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(VAULT_MARKET_CART_CHANGE_EVENT));
}

export function clearVaultMarketCart(): void {
  writeVaultMarketCart([]);
}

export function setCartItemQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
  maxQuantity = 99
): CartItem[] {
  const nextQty = Math.min(maxQuantity, Math.max(0, Math.trunc(quantity)));
  if (nextQty <= 0) {
    return items.filter((item) => item.product_id !== productId);
  }

  return items.map((item) =>
    item.product_id === productId ? { ...item, quantity: nextQty } : item
  );
}

export function removeCartItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.product_id !== productId);
}

export function addProductToCart(
  items: CartItem[],
  product: FoodVaultProduct,
  quantity = 1
): CartItem[] {
  const existing = items.find((item) => item.product_id === product.id);
  const nextQty = Math.min(
    product.stock_quantity,
    (existing?.quantity ?? 0) + quantity
  );

  if (nextQty <= 0) return items;

  const nextItem: CartItem = {
    product_id: product.id,
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    member_price: product.member_price,
    retail_price: product.retail_price,
    image_url: product.image_url,
    quantity: nextQty,
  };

  if (!existing) return [...items, nextItem];
  return items.map((item) => (item.product_id === product.id ? nextItem : item));
}
