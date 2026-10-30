"use client";

import { useActionState, useRef } from "react";
import { cancelOrder } from "@/app/actions";

// Cancelling cannot be undone, so it asks first. The confirmation is a native <dialog>:
// the browser traps focus inside it and closes it with Escape. The server still decides
// whether the cancellation is allowed (session, owner and status are checked in the action).
export default function CancelButton({ orderId }) {
  const dialogRef = useRef(null);
  const [state, formAction, isPending] = useActionState(async () => cancelOrder(orderId), null);

  return (
    <>
      <button type="button" className="btn btn-secondary btn-sm text-berbere" onClick={() => dialogRef.current?.showModal()}>
        Cancel
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`cancel-title-${orderId}`}
        className="m-auto w-[min(92vw,26rem)] rounded-xl border border-line bg-surface p-6 text-ink shadow-xl backdrop:bg-black/40"
      >
        <h2 id={`cancel-title-${orderId}`} className="text-xl font-bold">Cancel this order?</h2>
        <p className="mt-2 text-sm text-muted">The kitchen will stop preparing it. This cannot be undone.</p>
        {state && !state.ok && <p role="alert" className="field-error mt-3">{state.message}</p>}
        <form action={formAction} className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => dialogRef.current?.close()}>Keep order</button>
          <button disabled={isPending} className="btn btn-danger">{isPending ? "Cancelling…" : "Cancel order"}</button>
        </form>
      </dialog>
    </>
  );
}
