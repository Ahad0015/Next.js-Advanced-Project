// src/app/orders/[id]/page.js
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { orders } from "@/lib/db";
import { toPublic } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { IconChevronLeft } from "@/components/Icons";
import OrderStatus from "./OrderStatus";

// src/app/orders/[id]/page.js
export const metadata = {
  title: "Order status",
  description: "Live delivery status of your Addis Eats order.",
  robots: { index: false, follow: false },
};

// Dynamic: reads the session cookie and the order on every request.
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect(`/signin?next=/orders/${id}`);

  const order = orders.find((o) => o.id === id);

  // 404 for both "no such order" and "someone else's order",
  // so the page never confirms that another account's order exists.
  if (!order || order.userId !== session.userId) notFound();

  return (
    <main>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <Link href="/orders" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
          <IconChevronLeft width={16} height={16} /> All my orders
        </Link>
      </nav>
      <PageHeader title="Order status" description="Follow your order from the kitchen to your door." />
      <OrderStatus id={id} initialOrder={toPublic(order)} />
    </main>
  );
}
