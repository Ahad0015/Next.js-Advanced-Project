
import { dishes } from "@/app/menu/data";
import { orders } from "@/lib/db";
import { buildOrder } from "@/lib/orders";
import { errorResponse } from "@/lib/http";
import { orderSchema } from "@/lib/schema";
import { getSession } from "@/lib/session";

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return errorResponse(401, "UNAUTHENTICATED", "Sign in first");
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "BAD_JSON", "Request body must be valid JSON");
  }

  const result = orderSchema.safeParse(body);
  if (!result.success) {
    return errorResponse(422, "VALIDATION_FAILED", "Please fix the errors", {
      fieldErrors: result.error.flatten().fieldErrors,
    });
  }

  const dish = dishes.find((d) => d.id === result.data.dishId);
  if (!dish) {
    return errorResponse(422, "VALIDATION_FAILED", "Please fix the errors", {
      fieldErrors: { dishId: ["Unknown dish"] },
    });
  }

  const order = buildOrder({ userId: session.userId, data: result.data, dish });
  orders.push(order);

  return Response.json(order, { status: 201 });
}
