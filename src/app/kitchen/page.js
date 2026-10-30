import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { orders } from "@/lib/db";
import { toPublic } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { paginate, parseTableParams, sortRows } from "@/lib/tableQuery";
import { EmptyState, PageHeader } from "@/components/ui";
import OrderTable from "../orders/OrderTable";

export const metadata = {
  title: "Kitchen",
  description: "Staff view of all incoming orders.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const COLUMNS = ["date", "customer", "dish", "quantity", "area", "total", "status"];
const SORT_KEYS = ["date", "dish", "area", "total", "status"];
const GETTERS = {
  date: (o) => new Date(o.createdAt).getTime(),
  dish: (o) => o.dishName,
  area: (o) => o.neighbourhood ?? "",
  total: (o) => o.total,
  status: (o) => o.status,
};

export default async function KitchenPage({ searchParams }) {
  const sp = await searchParams;
  const session = await getSession();
  if (!session) redirect("/signin?next=/kitchen");
  if (session.role !== "staff") notFound(); // role checked here, on the server, not in the markup

  const { sort, dir, page, pageSize } = parseTableParams(sp, { sorts: SORT_KEYS, defaultSort: "date", defaultDir: "desc", pageSize: 8 });
  const all = orders.map(toPublic);
  const paged = paginate(sortRows(all, sort, dir, GETTERS), page, pageSize);

  return (
    <main>
      <PageHeader title="Kitchen" description="Every order placed through the app since the server started." />
      {all.length === 0 ? (
        <EmptyState title="No orders yet" action={<Link href="/dashboard" className="btn btn-secondary">Open the dashboard</Link>}>
          New orders appear here as soon as a customer places them.
        </EmptyState>
      ) : (
        <OrderTable rows={paged.rows} columns={COLUMNS} caption="All orders" basePath="/kitchen" query={{ sort, dir }} sort={sort} dir={dir} paging={paged} />
      )}
    </main>
  );
}
