import Link from "next/link";
import { redirect } from "next/navigation";
import { orders } from "@/lib/db";
import { toPublic } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { formatETB } from "@/lib/format";
import { IconCheck } from "@/components/Icons";
import ClearCart from "./ClearCart";

export const metadata = {
  title: "Order confirmed",
  description: "Your Addis Eats order has been placed.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NEXT_STEPS = [
  ["The kitchen prepares your food", "It is cooked to order, so it is hot when it leaves."],
  ["A rider brings it to you", "You can watch each step on the tracking page."],
  ["You pay on delivery", "Cash or mobile money, whichever you prefer."],
];

export default async function OrderSuccessPage({ searchParams }) {
  const { ids = "" } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/signin?next=/checkout");

  // The ids come from the URL, so only orders that belong to the signed-in user are shown.
  const wanted = String(ids).split(",").filter(Boolean).slice(0, 20);
  const placed = wanted
    .map((id) => orders.find((o) => o.id === id && o.userId === session.userId))
    .filter(Boolean)
    .map(toPublic);
  if (placed.length === 0) redirect("/orders");

  const total = placed.reduce((sum, o) => sum + o.total, 0);
  const first = placed[0];
  const trackHref = placed.length === 1 ? `/orders/${first.id}` : "/orders";

  return (
    <main className="mx-auto max-w-2xl">
      <ClearCart />
      <div className="card text-center" role="status">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
          <IconCheck width={30} height={30} />
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Thank you, {session.name}!</h1>
        <p className="mt-2 text-lg text-brand-strong font-semibold">Your order is confirmed.</p>
        <p className="mt-1 text-muted">The kitchen has received it. It should reach you in about 40 minutes.</p>
      </div>

      <section aria-labelledby="summary" className="card mt-6">
        <h2 id="summary" className="text-xl font-bold">Your order</h2>
        <ul className="mt-3 divide-y divide-line">
          {placed.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span>{o.quantity} × {o.dishName}</span>
              <span className="font-semibold">{formatETB(o.total)}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between border-t border-line pt-3 text-lg font-bold"><span>Total</span><span>{formatETB(total)}</span></p>
        <p className="mt-3 text-sm text-muted">Delivering to {first.address}{first.neighbourhood ? `, ${first.neighbourhood}` : ""}.</p>
      </section>

      <section aria-labelledby="next" className="card mt-6">
        <h2 id="next" className="text-xl font-bold">What happens next</h2>
        <ol className="mt-3 space-y-3">
          {NEXT_STEPS.map(([title, text], i) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-strong">{i + 1}</span>
              <div><p className="font-semibold">{title}</p><p className="text-sm text-muted">{text}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href={trackHref} className="btn btn-primary">{placed.length === 1 ? "Track your order" : "See my orders"}</Link>
        <Link href="/menu" className="btn btn-secondary">Order something else</Link>
      </div>
    </main>
  );
}
