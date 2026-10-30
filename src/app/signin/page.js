import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeNext } from "@/lib/safe-next";
import SignInForm from "./SignInForm";

export const metadata = {
  title: "Sign in",
  description: "Sign in to place and track your Addis Eats orders.",
  robots: { index: false, follow: false },
};

export default async function SignInPage({ searchParams }) {
  const { next } = await searchParams;
  const safe = safeNext(next);

  if (await getSession()) redirect(safe); // already signed in

  return (
    <main className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-muted">Sign in to place orders and follow them.</p>

      <div className="card mt-6">
        <SignInForm next={safe} />
      </div>

      {/* Development convenience only. Remove this block before real customers use the app. */}
      <details open className="mt-6 rounded-xl border border-line bg-surface p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Demo accounts (development only)</summary>
        <ul className="mt-3 space-y-1 text-muted">
          <li>Customer: hana@example.com / hana-pass-123</li>
          <li>Customer: dawit@example.com / dawit-pass-123</li>
          <li><strong>Staff</strong> (sees the Dashboard with the charts, and the Kitchen): kitchen@example.com / kitchen-pass-123</li>
        </ul>
      </details>
    </main>
  );
}
