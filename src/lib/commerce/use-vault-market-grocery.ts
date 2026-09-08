"use client";

import { useEffect, useState } from "react";
import {
  GROCERY_LIST_CHANGE_EVENT,
  readGroceryList,
} from "@/lib/commerce/grocery-list";

export function useVaultMarketGroceryCount() {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function sync() {
      setCount(readGroceryList().length);
      setReady(true);
    }

    sync();
    window.addEventListener(GROCERY_LIST_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(GROCERY_LIST_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { count, ready };
}
