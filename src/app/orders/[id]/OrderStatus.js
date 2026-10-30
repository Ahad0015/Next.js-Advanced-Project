"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { formatDate, formatETB, formatTime } from "@/lib/format";
import { IconAlert, IconCheck } from "@/components/Icons";

const STEPS = ["placed", "preparing", "on the way", "delivered"];
const FINISHED = ["delivered", "cancelled"];

// Polls the order every 5 seconds until it is finished. The page already rendered the first value
// on the server (fallbackData), so there is no spinner on first paint.
export default function OrderStatus({ id, initialOrder }) {
  const { data: order, error } = useSWR(`/api/orders/${id}`, fetcher, {
    fallbackData: initialOrder,
    refreshInterval: (latest) => (latest && FINISHED.includes(latest.status) ? 0 : 5000),
  });
  const current = STEPS.indexOf(order.status);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="card lg:col-span-2" aria-label="Order progress" aria-live="polite">
        {order.status === "cancelled" ? (
          <div className="alert alert-error"><IconAlert width={18} height={18} className="mt-0.5 shrink-0" /><p className="font-semibold">This order was cancelled.</p></div>
        ) : (
          <ol className="space-y-0">
            {STEPS.map((step, i) => {
              const done = i < current || order.status === "delivered";
              const here = i === current && order.status !== "delivered";
              return (
                <li key={step} aria-current={here ? "step" : undefined} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${done ? "border-brand bg-brand text-white" : here ? "border-brand bg-brand-soft text-brand-strong" : "border-line text-muted"}`}>
                      {done ? <IconCheck width={16} height={16} /> : i + 1}
                    </span>
                    {i < STEPS.length - 1 && <span className={`h-8 w-0.5 ${i < current ? "bg-brand" : "bg-line"}`} aria-hidden="true" />}
                  </div>
                  <div className="pb-6">
                    <p className={`font-semibold capitalize ${here ? "text-brand-strong" : done ? "" : "text-muted"}`}>{step}</p>
                    {here && <p className="text-sm text-muted">This is the current step.</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {error && (
          <p className="alert alert-info mt-2" role="status">Couldn&apos;t refresh just now. Showing the last known status.</p>
        )}
        {!FINISHED.includes(order.status) && <p className="hint">This page updates by itself every few seconds.</p>}
      </section>

      <aside className="card h-fit" aria-label="Order details">
        <h2 className="text-xl font-bold">Order details</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div><dt className="text-muted">Dish</dt><dd className="font-semibold">{order.quantity} × {order.dishName}</dd></div>
          <div><dt className="text-muted">Total</dt><dd className="font-semibold">{formatETB(order.total)}</dd></div>
          <div><dt className="text-muted">Delivering to</dt><dd>{order.address}{order.neighbourhood ? `, ${order.neighbourhood}` : ""}</dd></div>
          <div><dt className="text-muted">Placed</dt><dd>{formatDate(order.createdAt)} at {formatTime(order.createdAt)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
