// src/app/api/orders/[id]/route.js
import { orders } from "@/lib/db";
import { errorResponse } from "@/lib/http";
import { toPublic } from "@/lib/orders";
import { getSession } from "@/lib/session";

export async function GET(request, { params }) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    return errorResponse(401, "UNAUTHENTICATED", "Sign in first");
  }

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return errorResponse(404, "NOT_FOUND", "No such order");
  }
  if (order.userId !== session.userId) {
    return errorResponse(403, "FORBIDDEN", "That is not your order");
  }

  return Response.json(toPublic(order));
}