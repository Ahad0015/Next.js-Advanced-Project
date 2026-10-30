"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

// The cart lives in the browser. It never leaves it until checkout, and the server re-prices
// every line from the menu, so nothing in here is trusted.
const CartContext = createContext(null);
const STORAGE_KEY = "addis-eats-cart";
const MAX_QTY = 20; // the same limit the order schema enforces on the server

function clamp(qty) {
  return Math.min(MAX_QTY, Math.max(1, Math.trunc(Number(qty)) || 1));
}

// State is { items, ready }. `ready` turns true once the saved cart has been read,
// so the cart page can show a skeleton instead of flashing "empty".
function reducer(state, action) {
  const { items } = state;
  switch (action.type) {
    case "load":
      return { items: action.items, ready: true };
    case "add": {
      const found = items.find((i) => i.id === action.dish.id);
      const next = found
        ? items.map((i) => (i.id === found.id ? { ...i, qty: clamp(i.qty + action.qty) } : i))
        : [...items, { id: action.dish.id, name: action.dish.name, price: action.dish.price, qty: clamp(action.qty) }];
      return { ...state, items: next };
    }
    case "setQty":
      return { ...state, items: items.map((i) => (i.id === action.id ? { ...i, qty: clamp(action.qty) } : i)) };
    case "remove":
      return { ...state, items: items.filter((i) => i.id !== action.id) };
    case "clear":
      return items.length === 0 ? state : { ...state, items: [] }; // nothing to clear: keep the same state
    default:
      return state;
  }
}

// Whatever is in sessionStorage is untrusted input too: keep only well-formed lines.
function readStored() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => i && typeof i.id === "string" && typeof i.name === "string" && Number.isFinite(i.price) && i.price >= 0)
      .map((i) => ({ id: i.id, name: i.name, price: i.price, qty: clamp(i.qty) }));
  } catch {
    return [];
  }
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <Providers>");
  return ctx;
}

export default function Providers({ children }) {
  const [{ items, ready }, dispatch] = useReducer(reducer, { items: [], ready: false });

  // Restore the cart after the first render (not during it, so server and browser HTML match).
  useEffect(() => {
    dispatch({ type: "load", items: readStored() });
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage can be unavailable (private mode); the cart still works for this page view
    }
  }, [items, ready]);

  // dispatch never changes, so these functions are created once and keep the same identity on every render.
  // (If they were rebuilt whenever the cart changed, an effect that depends on clear() would run again
  // after every clear and loop forever.)
  const actions = useMemo(
    () => ({
      add: (dish, qty = 1) => dispatch({ type: "add", dish, qty }),
      setQty: (id, qty) => dispatch({ type: "setQty", id, qty }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
    }),
    []
  );

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((n, i) => n + i.qty * i.price, 0),
      ...actions,
    }),
    [items, ready, actions]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
