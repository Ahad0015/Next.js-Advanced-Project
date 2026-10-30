// src/lib/orders.js
import { dishes } from "@/app/menu/data";

export function getStatus(order) {
  if (order.status === "cancelled") return "cancelled";
  const seconds = (Date.now() - new Date(order.createdAt).getTime()) / 1000;
  if (seconds < 15) return "placed";
  if (seconds < 40) return "preparing";
  if (seconds < 70) return "on the way";
  return "delivered";
}

// The one place an order record is built, used by the form action AND the API.
// The price is looked up from the menu here, on the server, at the moment of the order
// and stored with it, so later menu price changes never rewrite past revenue.
export function buildOrder({ userId, data, dish, createdAt = new Date().toISOString() }) {
  return {
    id: crypto.randomUUID(),
    userId, // always from the session, never from the request body
    ...data, // only the fields the schema validated
    dishName: dish.name,
    unitPrice: dish.price,
    total: dish.price * data.quantity,
    status: "placed",
    createdAt,
  };
}

// What the browser is allowed to see about an order: the live status plus display fields.
export function toPublic(order) {
  const dish = dishes.find((d) => d.id === order.dishId);
  const quantity = Number(order.quantity) || 0;
  return {
    ...order,
    status: getStatus(order),
    dishName: order.dishName ?? dish?.name ?? `Dish ${order.dishId}`,
    total: Number.isFinite(order.total) ? order.total : (dish?.price ?? 0) * quantity,
  };
}
