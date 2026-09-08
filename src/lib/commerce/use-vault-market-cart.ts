"use client";

import { useEffect, useState } from "react";
import {
  VAULT_MARKET_CART_CHANGE_EVENT,
  cartItemCount,
  readVaultMarketCart,
} from "@/lib/commerce/cart";

export function useVaultMarketCartCount() {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function sync() {
      setCount(cartItemCount(readVaultMarketCart()));
      setReady(true);
    }

    sync();
    window.addEventListener(VAULT_MARKET_CART_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(VAULT_MARKET_CART_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { count, ready };
}
