"use server";

// Only async functions may be exported from a "use server" file.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDishes } from "@/app/menu/data";
import { orders } from "@/lib/db";
import { buildOrder, getStatus } from "@/lib/orders";
import { orderSchema, signInSchema } from "@/lib/schema";
import { safeNext } from "@/lib/safe-next";
import { createSession, destroySession, getSession } from "@/lib/session";
import { verifyUser } from "@/lib/users";

const FIELDS = ["name", "phone", "address", "neighbourhood", "dishId", "quantity"];

export async function signIn(prevState, formData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/")); // never trust a hidden field

  const parsed = signInSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { message: "Enter your email and password.", email };
  }

  const user = verifyUser(parsed.data.email, parsed.data.password);
  if (!user) {
    // One message for "no such email" and "wrong password".
    return { message: "Invalid email or password.", email };
  }

  await createSession(user.id); // a fresh session id on every sign-in
  // No specific destination? Staff land on the dashboard, customers on the home page.
  const destination = next === "/" && user.role === "staff" ? "/dashboard" : next;
  redirect(destination); // keep outside any try/catch: redirect works by throwing
}

export async function signOut() {
  await destroySession();
  return { ok: true };
}

// Places one order per dish in the cart. Every line is validated BEFORE anything is saved,
// so a bad line never leaves a half-placed order behind. Prices come from the menu, never the browser.
export async function placeOrder(prevState, formData) {
  const values = Object.fromEntries(FIELDS.map((k) => [k, String(formData.get(k) ?? "")]));

  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Please sign in to place an order.", fieldErrors: {}, values };
  }

  // The cart arrives as [{ id, qty }]. Without JavaScript there is no cart, so a single dish picked
  // in the form is used instead; that is what keeps the form working with JavaScript off.
  let lines = [];
  try {
    const parsed = JSON.parse(String(formData.get("items") || "[]"));
    if (Array.isArray(parsed)) lines = parsed;
  } catch {
    // ignore: treated as an empty cart below
  }
  if (lines.length === 0 && values.dishId) lines = [{ id: values.dishId, qty: values.quantity || 1 }];
  if (lines.length === 0) {
    // Still check the delivery details, so the person sees every problem at once.
    const details = orderSchema.omit({ dishId: true, quantity: true }).safeParse(values);
    const detailErrors = details.success ? {} : details.error.flatten().fieldErrors;
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: { ...detailErrors, items: ["Choose a dish, or add something to your cart first."] },
      values,
    };
  }

  const dishes = await getDishes();
  const fieldErrors = {};
  const addError = (field, messages) => {
    const key = field === "dishId" || field === "quantity" ? "items" : field;
    fieldErrors[key] = [...new Set([...(fieldErrors[key] ?? []), ...messages])];
  };

  const prepared = [];
  for (const line of lines.slice(0, 20)) {
    const result = orderSchema.safeParse({
      name: values.name,
      phone: values.phone,
      address: values.address,
      neighbourhood: values.neighbourhood,
      dishId: String(line?.id ?? ""),
      quantity: line?.qty,
    });
    if (!result.success) {
      for (const [field, messages] of Object.entries(result.error.flatten().fieldErrors)) addError(field, messages);
      continue;
    }
    const dish = dishes.find((d) => d.id === result.data.dishId);
    if (!dish) {
      addError("dishId", ["One of the dishes is no longer on the menu."]);
      continue;
    }
    prepared.push({ data: result.data, dish });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please fix the errors below.", fieldErrors, values };
  }

  const createdAt = new Date().toISOString();
  const created = prepared.map(({ data, dish }) => buildOrder({ userId: session.userId, data, dish, createdAt }));
  orders.push(...created);

  revalidatePath("/orders");
  revalidatePath("/dashboard");

  // Post/Redirect/Get: send the browser to a confirmation page. Refreshing it cannot place the order twice,
  // and it works with or without JavaScript. The page re-checks that these orders belong to the signed-in user.
  redirect(`/checkout/success?ids=${created.map((o) => o.id).join(",")}`);
}

export async function cancelOrder(orderId) {
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "You must be signed in to cancel an order." };
  }

  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return { ok: false, message: "Order not found." };
  }

  if (order.userId !== session.userId) {
    return { ok: false, message: "You can only cancel your own orders." };
  }

  // The rule lives here, not only in the button: a finished order cannot be cancelled,
  // however the action is called.
  const current = getStatus(order);
  if (current === "delivered" || current === "cancelled") {
    return { ok: false, message: `This order is already ${current}.` };
  }

  order.status = "cancelled";
  revalidatePath("/orders");
  revalidatePath("/dashboard");
  return { ok: true, message: "Order cancelled." };
}