import Link from "next/link";
import { EmptyState } from "@/components/ui";

export default function DishNotFound() {
  return (
    <main>
      <EmptyState title="We couldn't find that dish" action={<Link href="/menu" className="btn btn-primary">Back to the menu</Link>}>
        It may have been removed, or the link is not quite right. The full menu is one click away.
      </EmptyState>
    </main>
  );
}
