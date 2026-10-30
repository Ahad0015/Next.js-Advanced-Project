import Link from "next/link";
import { EmptyState } from "@/components/ui";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main>
      <EmptyState title="We could not find that page" action={<Link href="/menu" className="btn btn-primary">Browse the menu</Link>}>
        The link may be out of date, or the page may have moved.
      </EmptyState>
    </main>
  );
}
