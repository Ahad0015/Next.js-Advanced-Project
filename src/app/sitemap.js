// src/app/sitemap.js
import { getDishes } from "@/app/menu/data";
import { siteUrl } from "@/lib/site";

// Built from the real dish records. Private routes are left out on purpose.
export default async function sitemap() {
  const dishes = await getDishes();

  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/menu`, changeFrequency: "daily", priority: 0.9 },
    ...dishes.map((d) => ({
      url: `${siteUrl}/menu/${d.id}`,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
}