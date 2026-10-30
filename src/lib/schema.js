import { z } from "zod";
import { NEIGHBOURHOODS } from "./neighbourhoods";

export const orderSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{9,15}$/, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Address must be at least 5 characters"),
  neighbourhood: z.enum(NEIGHBOURHOODS, { error: "Choose your neighbourhood" }),
  dishId: z.string().min(1, "Pick a dish"),
  quantity: z.coerce.number().int().min(1, "At least 1").max(20, "At most 20"),
});
export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});