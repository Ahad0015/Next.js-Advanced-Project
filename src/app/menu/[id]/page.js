import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dishes } from "../data";
import { siteUrl } from "@/lib/site";
import { formatETB } from "@/lib/format";
import { IconChevronLeft } from "@/components/Icons";
import AddToCartButton from "../AddToCartButton";

export function generateStaticParams() {
  return dishes.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = dishes.find((d) => d.id === id);

  if (!dish) {
    return { title: "Dish not found", robots: { index: false } };
  }

  const description = `${dish.summary} ${dish.price} ETB.`;

  return {
    title: dish.name,
    description,
    alternates: { canonical: `/menu/${dish.id}` },
    // A child's openGraph replaces the parent's completely, so repeat siteName and type.
    openGraph: {
      title: dish.name,
      description,
      url: `/menu/${dish.id}`,
      siteName: "Addis Eats",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: dish.name, description },
  };
}

export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = dishes.find((d) => d.id === id);

  if (!dish) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.summary,
    image: `${siteUrl}${dish.image}`,
    offers: {
      "@type": "Offer",
      price: String(dish.price),
      priceCurrency: "ETB",
    },
    ...(dish.category === "Vegetarian" && {
      suitableForDiet: "https://schema.org/VegetarianDiet",
    }),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // "<" is escaped so dish text can never close the script tag
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <Link href="/menu" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
          <IconChevronLeft width={16} height={16} /> Back to the menu
        </Link>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <Image
          src={dish.image}
          alt={`${dish.name}, ${dish.category.toLowerCase()} at Addis Eats`}
          width={dish.width}
          height={dish.height}
          sizes="(min-width: 768px) 480px, 100vw"
          className="h-auto w-full rounded-xl border border-line"
        />
        <div>
          <span className="badge badge-neutral">{dish.category}</span>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{dish.name}</h1>
          <p className="mt-4 text-lg text-muted">{dish.summary}</p>
          <p className="mt-6 font-display text-3xl font-bold">{formatETB(dish.price)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton dish={{ id: dish.id, name: dish.name, price: dish.price }} size="md" />
            <Link href="/cart" className="btn btn-secondary">View cart</Link>
          </div>
          <p className="hint mt-4">Prices are confirmed again at checkout. Delivery to six neighbourhoods in Addis Ababa.</p>
        </div>
      </div>
    </main>
  );
}
