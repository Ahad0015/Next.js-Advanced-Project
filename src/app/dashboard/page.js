import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrders, liveOrderCount, parseRange, parseSource, summarize } from "@/lib/analytics";
import { formatETB } from "@/lib/format";
import { paginate, parseTableParams, sortRows } from "@/lib/tableQuery";
import { EmptyState, PageHeader } from "@/components/ui";
import { IconChart } from "@/components/Icons";
import OrderTable from "../orders/OrderTable";
import { OrdersLineChart, RevenueBarChart } from "./RevenueChart";
import { DataTable, Filters, SourceBanner, SummaryCard } from "./parts";

export const metadata = {
  title: "Dashboard",
  description: "Revenue, orders and neighbourhood performance for Addis Eats staff.",
  robots: { index: false, follow: false },
};

// Dynamic: it depends on who is asking (staff only) and on the live orders at this moment.
export const dynamic = "force-dynamic";

const COLUMNS = ["date", "customer", "dish", "quantity", "area", "total", "status"];
const SORT_KEYS = ["date", "dish", "area", "total", "status"];
const GETTERS = {
  date: (o) => new Date(o.createdAt).getTime(),
  dish: (o) => o.dishName,
  area: (o) => o.neighbourhood,
  total: (o) => o.total,
  status: (o) => o.status,
};

export default async function DashboardPage({ searchParams }) {
  const sp = await searchParams;

  // Protection happens here, on the server, for every request: signed out -> sign in, not staff -> 404.
  const session = await getSession();
  if (!session) redirect("/signin?next=/dashboard");
  if (session.role !== "staff") notFound();

  // Class-exercise switches that force each state to appear: /dashboard?demo=loading | empty | error
  if (sp.demo === "error") throw new Error("Demo error: the dashboard could not be loaded.");
  if (sp.demo === "loading") await new Promise((r) => setTimeout(r, 2500));

  const liveCount = liveOrderCount();
  const source = parseSource(sp.source, liveCount);
  const rangeKey = parseRange(sp.range);

  // Aggregate on the server. Only the small summaries below are passed to the client chart code.
  const orders = sp.demo === "empty" ? [] : getOrders(source);
  const summary = summarize(orders, rangeKey);
  const { current, change, range } = summary;

  const { sort, dir, page, pageSize } = parseTableParams(sp, { sorts: SORT_KEYS, defaultSort: "date", defaultDir: "desc", pageSize: 5 });
  const query = { range: rangeKey, source: sp.source === "live" || sp.source === "sample" ? sp.source : undefined, sort, dir };
  const paged = paginate(sortRows(summary.rows, sort, dir, GETTERS), page, pageSize);

  const hasData = summary.rows.length > 0;
  const barLabel = `Bar chart: revenue by neighbourhood, ${range.label.toLowerCase()}`;
  const lineLabel = `Line chart: orders per ${range.unit}, ${range.label.toLowerCase()}`;

  return (
    <main>
      <PageHeader title="Dashboard" description="How the business is doing: revenue, orders and where they come from." />

      {sp.demo && (
        <p className="alert alert-info mb-4" role="note">Demonstration mode: showing the “{sp.demo}” state. <Link href="/dashboard" className="font-semibold underline">Back to normal</Link></p>
      )}

      <SourceBanner source={source} liveCount={liveCount} />
      <Filters range={rangeKey} source={source} query={query} />

      {!hasData ? (
        <EmptyState
          Icon={IconChart}
          title={source === "live" ? "No orders in this period yet" : "No data to show"}
          action={
            <>
              {source === "live" && <Link href="/dashboard?source=sample" className="btn btn-primary">Show sample data</Link>}
              <Link href="/menu" className="btn btn-secondary">Place a test order</Link>
            </>
          }
        >
          {source === "live"
            ? "Orders placed through the app appear here as soon as they are made. Choose a longer range, switch to the sample data, or place an order to see the charts fill in."
            : "There are no orders for this range."}
        </EmptyState>
      ) : (
        <div className="space-y-8">
          <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label={`Revenue, ${range.label.toLowerCase()}`} value={formatETB(current.revenue)} change={change.revenue} />
            <SummaryCard label="Orders" value={current.orders.toLocaleString("en-US")} change={change.orders} />
            <SummaryCard label="Average order value" value={formatETB(current.average)} change={change.average} />
            <SummaryCard label="Cancelled orders" value={current.cancelled.toLocaleString("en-US")} note="Not counted in revenue." />
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section aria-labelledby="by-area" className="card">
              <h2 id="by-area" className="text-xl font-bold">Revenue by neighbourhood</h2>
              <p className="mb-4 text-sm text-muted">{range.label}, in Ethiopian birr (ETB).</p>
              <RevenueBarChart data={summary.byNeighbourhood} label={barLabel} />
              <div className="mt-5">
                <DataTable
                  caption="Revenue by neighbourhood, the same data as the chart"
                  columns={[
                    { key: "name", label: "Neighbourhood" },
                    { key: "orders", label: "Orders", numeric: true },
                    { key: "revenue", label: "Revenue", numeric: true },
                    { key: "share", label: "Share", numeric: true },
                  ]}
                  rows={summary.byNeighbourhood.map((r) => ({
                    name: r.name,
                    orders: r.orders,
                    revenue: formatETB(r.revenue),
                    share: current.revenue ? `${((r.revenue / current.revenue) * 100).toFixed(1)}%` : "0%",
                  }))}
                />
              </div>
            </section>

            <section aria-labelledby="over-time" className="card">
              <h2 id="over-time" className="text-xl font-bold">Orders per {range.unit}, {range.label.toLowerCase()}</h2>
              <p className="mb-4 text-sm text-muted">Cancelled orders are not counted.</p>
              <OrdersLineChart data={summary.series} label={lineLabel} unit={range.unit} />
              <details className="mt-5">
                <summary className="cursor-pointer text-sm font-semibold text-brand">Show the chart data as a table</summary>
                <div className="mt-3">
                  <DataTable
                    caption={`Orders and revenue per ${range.unit}, the same data as the chart`}
                    columns={[
                      { key: "label", label: range.unit === "week" ? "Week starting" : "Day" },
                      { key: "orders", label: "Orders", numeric: true },
                      { key: "revenue", label: "Revenue", numeric: true },
                    ]}
                    rows={summary.series.map((p) => ({ label: p.label, orders: p.orders, revenue: formatETB(p.revenue) }))}
                  />
                </div>
              </details>
            </section>
          </div>

          <section aria-labelledby="top-dishes" className="card">
            <h2 id="top-dishes" className="mb-4 text-xl font-bold">Best-selling dishes</h2>
            <DataTable
              caption={`Top dishes by revenue, ${range.label.toLowerCase()}`}
              columns={[
                { key: "name", label: "Dish" },
                { key: "quantity", label: "Portions sold", numeric: true },
                { key: "revenue", label: "Revenue", numeric: true },
              ]}
              rows={summary.topDishes.map((d) => ({ name: d.name, quantity: d.quantity, revenue: formatETB(d.revenue) }))}
            />
          </section>

          <section aria-labelledby="recent">
            <h2 id="recent" className="mb-4 text-xl font-bold">Orders in this period</h2>
            <OrderTable
              rows={paged.rows}
              columns={COLUMNS}
              caption="Orders in this period"
              basePath="/dashboard"
              query={query}
              sort={sort}
              dir={dir}
              paging={paged}
            />
          </section>
        </div>
      )}
    </main>
  );
}
