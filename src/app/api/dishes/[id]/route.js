// src/app/api/dishes/[id]/route.js
import { dishes } from "@/app/menu/data";
import { errorResponse } from "@/lib/http";

export async function GET(request, { params }) {
  const { id } = await params;
  const dish = dishes.find((d) => d.id === id);

  if (!dish) {
    return errorResponse(404, "NOT_FOUND", `No dish with id "${id}"`);
  }
  return Response.json(dish);
}