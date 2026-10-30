// src/app/api/me/route.js
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  return Response.json({
    user: session ? { name: session.name, role: session.role } : null,
  });
}