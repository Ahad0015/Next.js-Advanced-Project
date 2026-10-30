"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions";
import { IconAlert } from "@/components/Icons";

const initialState = { message: "", email: "" };

export default function SignInForm({ next }) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {state.message && (
        <div className="alert alert-error" role="alert">
          <IconAlert width={18} height={18} className="mt-0.5 shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" defaultValue={state.email} className="field" aria-invalid={state.message ? "true" : undefined} />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" className="field" aria-invalid={state.message ? "true" : undefined} />
      </div>

      <button disabled={isPending} className="btn btn-primary w-full">
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
