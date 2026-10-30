"use client";

import Link from "next/link";
import { IconAlert } from "@/components/Icons";

// The error state for every segment that has no error file of its own (orders, dashboard, kitchen...).
// Next.js shows this instead of a blank page, keeps the header and footer, and offers a retry.
export default function Error({ error, reset }) {
  return (
    <main className="mx-auto max-w-lg py-10 text-center" role="alert">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-berbere-soft text-berbere">
        <IconAlert width={26} height={26} />
      </span>
      <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted">
        We could not load this page. Your data is safe. Try again, and if it keeps happening, come back in a few minutes.
      </p>
      {error?.digest && <p className="hint">Reference: {error.digest}</p>}
      <div className="mt-6 flex justify-center gap-2">
        <button type="button" onClick={() => reset()} className="btn btn-primary">Try again</button>
        <Link href="/" className="btn btn-secondary">Go to the home page</Link>
      </div>
    </main>
  );
}
