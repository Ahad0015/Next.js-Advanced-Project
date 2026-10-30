import Link from "next/link";
import { redirect } from "next/navigation";
import { orders } from "@/lib/db";
import { toPublic } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { paginate, parseTableParams, sortRows } from "@/lib/tableQuery";
import { EmptyState, PageHeader } from "@/components/ui";
import CancelButton from "./CancelButton";
import OrderTable from "./OrderTable";

export const metadata = {
  title: "My orders",
  description: "Your Addis Eats orders and where each one is right now.",
  robots: { index: false, follow: false },
};

// Dynamic: reads the session cookie, which only exists at request time.
export const dynamic = "force-dynamic";

const COLUMNS = ["date", "dish", "quantity", "area", "total", "status"];
const SORT_KEYS = ["date", "dish", "area", "total", "status"];
const GETTERS = {
  date: (o) => new Date(o.createdAt).getTime(),
  dish: (o) => o.dishName,
  area: (o) => o.neighbourhood ?? "",
  total: (o) => o.total,
  status: (o) => o.status,
};

export default async function OrdersPage({ searchParams }) {
  const sp = await searchParams;
  const session = await getSession();
  if (!session) redirect("/signin?next=/orders");

  // Class-exercise switches that force each state to appear: /orders?demo=error | empty | loading
  if (sp.demo === "error") throw new Error("Demo error: the orders could not be loaded.");
  if (sp.demo === "loading") await new Promise((r) => setTimeout(r, 2500));

  const { sort, dir, page, pageSize } = parseTableParams(sp, { sorts: SORT_KEYS, defaultSort: "date", defaultDir: "desc", pageSize: 5 });

  // Scoped to the session id: another account's orders can never appear here.
  const mine = sp.demo === "empty" ? [] : orders.filter((o) => o.userId === session.userId).map(toPublic);
  const paged = paginate(sortRows(mine, sort, dir, GETTERS), page, pageSize);

  return (
    <main>
      <PageHeader
        title="My orders"
        description="Everything you have ordered, newest first. Open an order to follow it live."
        actions={<Link href="/menu" className="btn btn-primary">Order something</Link>}
      />

      {sp.demo && (
        <p className="alert alert-info mb-4" role="note">Demonstration mode: showing the “{sp.demo}” state. <Link href="/orders" className="font-semibold underline">Back to normal</Link></p>
      )}

      {mine.length === 0 ? (
        <EmptyState title="No orders yet" action={<Link href="/menu" className="btn btn-primary">Browse the menu</Link>}>
          When you place an order it will appear here, and you can follow it until it arrives.
        </EmptyState>
      ) : (
        <OrderTable
          rows={paged.rows}
          columns={COLUMNS}
          caption="Your orders"
          basePath="/orders"
          query={{ sort, dir }}
          sort={sort}
          dir={dir}
          paging={paged}
          actionsLabel="Track or cancel"
          renderActions={(o) => (
            <div className="flex items-center gap-2">
              <Link href={`/orders/${o.id}`} className="btn btn-secondary btn-sm">Track</Link>
              {!["delivered", "cancelled"].includes(o.status) && <CancelButton orderId={o.id} />}
            </div>
          )}
        />
      )}
    </main>
  );
}
