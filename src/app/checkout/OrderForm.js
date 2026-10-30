"use client";

import { useActionState } from "react";
import Link from "next/link";
import { placeOrder } from "@/app/actions";
import { useCart } from "../providers";
import { NEIGHBOURHOODS } from "@/lib/neighbourhoods";
import { formatETB } from "@/lib/format";
import { IconAlert } from "@/components/Icons";

const initialState = { ok: false, message: "", fieldErrors: {}, values: {} };

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="hint">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="field-error">
          <IconAlert width={16} height={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

export default function OrderForm({ dishes, defaultName, initialDish }) {
  const { items, ready, total } = useCart();
  const [state, formAction, isPending] = useActionState(placeOrder, initialState);
  const err = (field) => state.fieldErrors[field]?.[0];
  const props = (id) => ({
    id,
    name: id,
    className: "field",
    "aria-invalid": err(id) ? "true" : undefined,
    "aria-describedby": err(id) ? `${id}-error` : undefined,
  });

  const hasCart = items.length > 0;
  // Only ids and quantities leave the browser. The server looks up the price of every dish.
  const lines = items.map((i) => ({ id: i.id, qty: i.qty }));

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-3" noValidate>
      <input type="hidden" name="items" value={JSON.stringify(lines)} />

      <div className="card space-y-5 lg:col-span-2">
        <h2 className="text-xl font-bold">Delivery details</h2>

        {state.message && !state.ok && (
          <div className="alert alert-error" role="alert">
            <IconAlert width={18} height={18} className="mt-0.5 shrink-0" />
            <p>{state.message}</p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Full name" error={err("name")}>
            <input {...props("name")} autoComplete="name" defaultValue={state.values.name ?? defaultName} />
          </Field>
          <Field id="phone" label="Phone" error={err("phone")} hint="For example 0911223344">
            <input {...props("phone")} type="tel" autoComplete="tel" defaultValue={state.values.phone} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="neighbourhood" label="Neighbourhood" error={err("neighbourhood")}>
            <select {...props("neighbourhood")} defaultValue={state.values.neighbourhood ?? ""}>
              <option value="" disabled>Choose your neighbourhood</option>
              {NEIGHBOURHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field id="address" label="Street address or landmark" error={err("address")}>
            <input {...props("address")} autoComplete="street-address" defaultValue={state.values.address} />
          </Field>
        </div>

        {/* Without a cart (or without JavaScript) a single dish can be ordered straight from the form. */}
        {!hasCart && (
          <fieldset className="space-y-5 rounded-lg border border-line p-4">
            <legend className="px-1 text-sm font-semibold">Order one dish now</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="dishId" label="Dish" error={err("items")}>
                <select {...props("dishId")} aria-invalid={err("items") ? "true" : undefined} aria-describedby={err("items") ? "dishId-error" : undefined} defaultValue={state.values.dishId ?? initialDish}>
                  <option value="">Choose a dish</option>
                  {dishes.map((d) => <option key={d.id} value={d.id}>{d.name} · {formatETB(d.price)}</option>)}
                </select>
              </Field>
              <Field id="quantity" label="Quantity">
                <input {...props("quantity")} type="number" min="1" max="20" defaultValue={state.values.quantity ?? 1} />
              </Field>
            </div>
            <p className="hint">
              Or <Link href="/menu" className="font-semibold text-brand underline">fill your cart from the menu</Link> to order several dishes.
            </p>
          </fieldset>
        )}
      </div>

      <aside className="card h-fit" aria-label="Order summary">
        <h2 className="text-xl font-bold">Your order</h2>
        {!ready ? (
          <p className="mt-3 text-sm text-muted">Loading your cart…</p>
        ) : hasCart ? (
          <>
            <ul className="mt-3 divide-y divide-line text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between py-2"><span>{i.qty} × {i.name}</span><span>{formatETB(i.price * i.qty)}</span></li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between text-base font-bold"><span>Total</span><span>{formatETB(total)}</span></p>
            {err("items") && <p role="alert" className="field-error">{err("items")}</p>}
            <p className="hint"><Link href="/cart" className="underline">Change your cart</Link></p>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">Your cart is empty.</p>
        )}
        <button disabled={isPending} className="btn btn-primary mt-5 w-full">
          {isPending ? "Placing your order…" : "Place order"}
        </button>
        <p className="hint">Payment is collected on delivery.</p>
      </aside>
    </form>
  );
}
