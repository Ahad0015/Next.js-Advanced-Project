// src/app/api/dishes/route.js
import { dishes } from "@/app/menu/data";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));

  const filtered = q
    ? dishes.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      )
    : dishes;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const items = filtered.slice((page - 1) * limit, page * limit);

  // TEMPORARY: uncomment to simulate a slow network while testing, remove after
  // await new Promise((r) => setTimeout(r, 400));

  return Response.json({ items, page, limit, total, totalPages });
}