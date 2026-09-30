"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CartDrawer } from "@/components/pantry/CartDrawer";
import { GroceryListDrawer } from "@/components/pantry/GroceryListDrawer";
import {
  VAULT_MARKET_CART_CHANGE_EVENT,
  VAULT_MARKET_CART_OPEN_EVENT,
  addProductToCart,
  consumeVaultMarketCartOpenFlag,
  readVaultMarketCart,
  removeCartItem,
  setCartItemQuantity,
  writeVaultMarketCart,
} from "@/lib/commerce/cart";
import {
  GROCERY_LIST_CHANGE_EVENT,
  GROCERY_LIST_OPEN_EVENT,
  addGroceryItemsToCart,
  consumeGroceryListOpenFlag,
  readGroceryList,
  removeGroceryListItem,
  setGroceryListQuantity,
  setGroceryListSelected,
  toggleGroceryListItem,
  writeGroceryList,
} from "@/lib/commerce/grocery-list";
import type { CartItem, FoodVaultProduct, GroceryListItem } from "@/types/commerce";

type PantryMarketContextValue = {
  products: FoodVaultProduct[];
  cart: CartItem[];
  groceryList: GroceryListItem[];
  liveQuery: string;
  setLiveQuery: (query: string) => void;
  addedIds: Record<string, true>;
  addToCart: (product: FoodVaultProduct, quantity?: number) => void;
  toggleGrocery: (product: FoodVaultProduct) => void;
  isSaved: (productId: string) => boolean;
  openCart: () => void;
  openGrocery: () => void;
  memberUnlocked: boolean;
};

const PantryMarketContext = createContext<PantryMarketContextValue | null>(null);

export function usePantryMarket() {
  const value = useContext(PantryMarketContext);
  if (!value) {
    throw new Error("usePantryMarket must be used within PantryMarketProvider");
  }
  return value;
}

export function PantryMarketProvider({
  products,
  children,
}: {
  products: FoodVaultProduct[];
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [groceryList, setGroceryList] = useState<GroceryListItem[]>([]);
  const [liveQuery, setLiveQuery] = useState("");
  const [addedIds, setAddedIds] = useState<Record<string, true>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [groceryOpen, setGroceryOpen] = useState(false);

  const persistCart = useCallback((next: CartItem[]) => {
    setCart(next);
    writeVaultMarketCart(next);
  }, []);

  const persistGrocery = useCallback((next: GroceryListItem[]) => {
    setGroceryList(next);
    writeGroceryList(next);
  }, []);

  useEffect(() => {
    setCart(readVaultMarketCart());
    setGroceryList(readGroceryList());
    if (consumeVaultMarketCartOpenFlag()) {
      setGroceryOpen(false);
      setCartOpen(true);
    } else if (consumeGroceryListOpenFlag()) {
      setCartOpen(false);
      setGroceryOpen(true);
    }

    function handleCartOpen() {
      setGroceryOpen(false);
      setCartOpen(true);
    }

    function handleGroceryOpen() {
      setCartOpen(false);
      setGroceryOpen(true);
    }

    function handleCartChange() {
      setCart(readVaultMarketCart());
    }

    function handleGroceryChange() {
      setGroceryList(readGroceryList());
    }

    window.addEventListener(VAULT_MARKET_CART_OPEN_EVENT, handleCartOpen);
    window.addEventListener(GROCERY_LIST_OPEN_EVENT, handleGroceryOpen);
    window.addEventListener(VAULT_MARKET_CART_CHANGE_EVENT, handleCartChange);
    window.addEventListener(GROCERY_LIST_CHANGE_EVENT, handleGroceryChange);
    window.addEventListener("storage", handleCartChange);
    window.addEventListener("storage", handleGroceryChange);
    return () => {
      window.removeEventListener(VAULT_MARKET_CART_OPEN_EVENT, handleCartOpen);
      window.removeEventListener(GROCERY_LIST_OPEN_EVENT, handleGroceryOpen);
      window.removeEventListener(VAULT_MARKET_CART_CHANGE_EVENT, handleCartChange);
      window.removeEventListener(GROCERY_LIST_CHANGE_EVENT, handleGroceryChange);
      window.removeEventListener("storage", handleCartChange);
      window.removeEventListener("storage", handleGroceryChange);
    };
  }, []);

  const stockById = useMemo(
    () => new Map(products.map((product) => [product.id, product.stock_quantity])),
    [products]
  );

  const addToCart = useCallback(
    (product: FoodVaultProduct, quantity = 1) => {
      persistCart(addProductToCart(cart, product, quantity));
      setGroceryOpen(false);
      setCartOpen(true);
      setAddedIds((current) => ({ ...current, [product.id]: true }));
      window.setTimeout(() => {
        setAddedIds((current) => {
          const nextIds = { ...current };
          delete nextIds[product.id];
          return nextIds;
        });
      }, 1600);
    },
    [cart, persistCart]
  );

  const toggleGrocery = useCallback(
    (product: FoodVaultProduct) => {
      persistGrocery(toggleGroceryListItem(groceryList, product));
    },
    [groceryList, persistGrocery]
  );

  const isSaved = useCallback(
    (productId: string) => groceryList.some((item) => item.product_id === productId),
    [groceryList]
  );

  const openCart = useCallback(() => {
    setGroceryOpen(false);
    setCartOpen(true);
  }, []);

  const openGrocery = useCallback(() => {
    setCartOpen(false);
    setGroceryOpen(true);
  }, []);

  const value = useMemo<PantryMarketContextValue>(
    () => ({
      products,
      cart,
      groceryList,
      liveQuery,
      setLiveQuery,
      addedIds,
      addToCart,
      toggleGrocery,
      isSaved,
      openCart,
      openGrocery,
      memberUnlocked: true,
    }),
    [
      products,
      cart,
      groceryList,
      liveQuery,
      addedIds,
      addToCart,
      toggleGrocery,
      isSaved,
      openCart,
      openGrocery,
    ]
  );

  return (
    <PantryMarketContext.Provider value={value}>
      {children}
      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onIncrement={(productId) => {
          const item = cart.find((entry) => entry.product_id === productId);
          if (!item) return;
          persistCart(
            setCartItemQuantity(
              cart,
              productId,
              item.quantity + 1,
              stockById.get(productId) ?? 99
            )
          );
        }}
        onDecrement={(productId) => {
          const item = cart.find((entry) => entry.product_id === productId);
          if (!item) return;
          persistCart(setCartItemQuantity(cart, productId, item.quantity - 1));
        }}
        onRemove={(productId) => persistCart(removeCartItem(cart, productId))}
      />
      <GroceryListDrawer
        open={groceryOpen}
        items={groceryList}
        onClose={() => setGroceryOpen(false)}
        onQuantityChange={(productId, quantity) =>
          persistGrocery(setGroceryListQuantity(groceryList, productId, quantity))
        }
        onSelectedChange={(productId, selected) =>
          persistGrocery(setGroceryListSelected(groceryList, productId, selected))
        }
        onRemove={(productId) =>
          persistGrocery(removeGroceryListItem(groceryList, productId))
        }
        onAddSelectedToCart={() => {
          persistCart(addGroceryItemsToCart(cart, groceryList, products));
          setGroceryOpen(false);
          setCartOpen(true);
        }}
      />
    </PantryMarketContext.Provider>
  );
}
