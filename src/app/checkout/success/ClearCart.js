"use client";

import { useEffect } from "react";
import { useCart } from "@/app/providers";

// Empties the cart once, after the order has been placed. It draws nothing.
export default function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
