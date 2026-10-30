"use client";

import Link from "next/link";
import { useCart } from "../providers";
import { formatETB } from "@/lib/format";
import { EmptyState, Skeleton } from "@/components/ui";
import { IconCart, IconMinus, IconPlus, IconTrash } from "@/components/Icons";

export default function CartView() {
  const { items, ready, total, count, setQty, remove, clear } = useCart();

  if (!ready) {
    return (
      <div className="grid gap-6 lg:grid-cols-3" aria-busy="true">
        <Skeleton className="h-48 lg:col-span-2" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState Icon={IconCart} title="Your cart is empty" action={<Link href="/menu" className="btn btn-primary">Browse the menu</Link>}>
        Add a dish from the menu and it will show up here.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section aria-label="Items in your cart" className="card lg:col-span-2 !p-0">
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/menu/${i.id}`} className="font-semibold hover:underline">{i.name}</Link>
                <p className="text-sm text-muted">{formatETB(i.price)} each</p>
              </div>
              <div className="flex items-center gap-1" role="group" aria-label={`Quantity of ${i.name}`}>
                <button type="button" className="btn btn-secondary btn-sm px-2" onClick={() => setQty(i.id, i.qty - 1)} disabled={i.qty <= 1} aria-label={`Decrease quantity of ${i.name}`}>
                  <IconMinus width={16} height={16} />
                </button>
                <span className="w-8 text-center font-semibold" aria-live="polite">{i.qty}</span>
                <button type="button" className="btn btn-secondary btn-sm px-2" onClick={() => setQty(i.id, i.qty + 1)} disabled={i.qty >= 20} aria-label={`Increase quantity of ${i.name}`}>
                  <IconPlus width={16} height={16} />
                </button>
              </div>
              <p className="w-24 text-right font-semibold">{formatETB(i.price * i.qty)}</p>
              <button type="button" className="btn btn-ghost btn-sm px-2 text-berbere" onClick={() => remove(i.id)} aria-label={`Remove ${i.name} from the cart`}>
                <IconTrash width={18} height={18} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="card h-fit" aria-label="Order summary">
        <h2 className="text-xl font-bold">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Items</dt><dd>{count}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>{formatETB(total)}</dd></div>
        </dl>
        <p className="hint">Prices are confirmed again when you place the order.</p>
        <Link href="/checkout" className="btn btn-primary mt-5 w-full">Continue to checkout</Link>
        <button type="button" onClick={clear} className="btn btn-ghost mt-2 w-full text-muted">Clear cart</button>
      </aside>
    </div>
  );
}
