"use client";

import { useState } from "react";
import { useCart } from "../providers";
import { IconCheck, IconPlus } from "@/components/Icons";

// A small client leaf inside server-rendered cards. It receives plain data only
// ({ id, name, price }); the server re-prices everything again at checkout.
export default function AddToCartButton({ dish, size = "sm", label = "Add to cart" }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    add({ id: dish.id, name: dish.name, price: dish.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500); // brief confirmation, then back to normal
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn ${added ? "btn-secondary" : "btn-primary"} ${size === "sm" ? "btn-sm" : ""}`}
      aria-label={added ? `${dish.name} added to cart` : `${label}: ${dish.name}`}
    >
      {added ? <IconCheck width={16} height={16} /> : <IconPlus width={16} height={16} />}
      <span aria-hidden="true">{added ? "Added" : label}</span>
      <span className="sr-only" role="status">{added ? `${dish.name} added to your cart` : ""}</span>
    </button>
  );
}
