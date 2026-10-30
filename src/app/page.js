import Image from "next/image";
import Link from "next/link";
import { getDishes } from "./menu/data";
import DishCard from "./menu/DishCard";
import { NEIGHBOURHOODS } from "@/lib/neighbourhoods";

export const metadata = {
  title: { absolute: "Addis Eats: Ethiopian food, delivered" },
  description:
    "Order doro wat, kitfo, shiro and more from Addis Eats. Fresh Ethiopian food, delivered to your door.",
};

// Static: the same for every visitor, built once.
export default async function Home() {
  const picks = (await getDishes()).slice(0, 3);

  return (
    <main className="space-y-16">
      <section className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">Ethiopian food, at your door in Addis.</h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Doro wat, kitfo, shiro and more, cooked to order and delivered across six neighbourhoods.
            Pick your dishes, check out in a minute and follow the order until it arrives.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-primary px-6">Browse the menu</Link>
            <Link href="/orders" className="btn btn-secondary px-6">Track an order</Link>
          </div>
        </div>
        {/* hero.jpg is a square 1254x1254 file. A fixed box with object-cover crops it instead of
            stretching it, and the box reserves the space so nothing shifts while it loads. */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line">
          <Image
            src="/images/hero.jpg"
            alt="A table of Ethiopian dishes served on injera"
            fill
            sizes="(min-width: 768px) 560px, 100vw"
            preload
            className="object-cover"
          />
        </div>
      </section>

      <section aria-labelledby="picks-heading">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="picks-heading" className="text-2xl font-bold sm:text-3xl">From the menu</h2>
          <Link href="/menu" className="text-sm font-semibold text-brand hover:underline">See every dish</Link>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((d) => <DishCard key={d.id} dish={d} />)}
        </ul>
      </section>

      <section aria-labelledby="areas-heading" className="card">
        <h2 id="areas-heading" className="text-xl font-bold">Where we deliver</h2>
        <p className="mt-1 text-muted">Choose your neighbourhood at checkout.</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {NEIGHBOURHOODS.map((n) => <li key={n} className="badge badge-ok text-sm">{n}</li>)}
        </ul>
      </section>
    </main>
  );
}
