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
import { useMemberSignupCtaContext } from "@/components/member/MemberSignupCtaProvider";
import { CartDrawer } from "@/components/pantry/CartDrawer";
import { GroceryListDrawer } from "@/components/pantry/GroceryListDrawer";
import { MemberGateModal } from "@/components/pantry/MemberGateModal";
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
  const [gateOpen, setGateOpen] = useState(false);
  const [gateSavings, setGateSavings] = useState(0);
  const [gateProductName, setGateProductName] = useState<string | undefined>();
  const { isActiveMember, isMember, isLoading } = useMemberSignupCtaContext();

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

  const openMemberGate = useCallback((savings: number, productName?: string) => {
    if (isLoading) return;
    setGateSavings(savings);
    setGateProductName(productName);
    setGateOpen(true);
  }, [isLoading]);

  const addToCart = useCallback(
    (product: FoodVaultProduct, quantity = 1) => {
      if (!isActiveMember) {
        const unitSave = Math.max(0, product.retail_price - product.member_price);
        openMemberGate(unitSave * Math.max(1, quantity), product.name);
        return;
      }
      persistCart(addProductToCart(cart, product, quantity));
      setAddedIds((current) => ({ ...current, [product.id]: true }));
      window.setTimeout(() => {
        setAddedIds((current) => {
          const nextIds = { ...current };
          delete nextIds[product.id];
          return nextIds;
        });
      }, 1600);
    },
    [cart, isActiveMember, openMemberGate, persistCart]
  );

  const toggleGrocery = useCallback(
    (product: FoodVaultProduct) => {
      const alreadySaved = groceryList.some((item) => item.product_id === product.id);
      if (!alreadySaved && !isActiveMember) {
        openMemberGate(Math.max(0, product.retail_price - product.member_price), product.name);
        return;
      }
      persistGrocery(toggleGroceryListItem(groceryList, product));
    },
    [groceryList, isActiveMember, openMemberGate, persistGrocery]
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
        memberUnlocked={isActiveMember}
        onMembershipRequired={(savings) => openMemberGate(savings)}
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
          if (!isActiveMember) {
            const selected = groceryList.filter((item) => item.selected);
            const savings = selected.reduce((sum, item) => {
              return sum + Math.max(0, item.retail_price - item.member_price) * item.quantity;
            }, 0);
            openMemberGate(savings);
            return;
          }
          persistCart(addGroceryItemsToCart(cart, groceryList, products));
          setGroceryOpen(false);
          setCartOpen(true);
        }}
      />
      <MemberGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        savings={gateSavings}
        productName={gateProductName}
        isLoggedIn={isMember}
      />
    </PantryMarketContext.Provider>
  );
}
