// Checks the dashboard maths against an independent, brute-force calculation.
// Run with:  npm run test:analytics
import assert from "node:assert/strict";
import { getSampleOrders, SAMPLE_DAYS } from "@/lib/sampleData";
import { getOrders, summarize, parseRange, parseSource, RANGES } from "@/lib/analytics";
import { describeChange, addisDayIndex, addisDayStart, formatETB } from "@/lib/format";
import { parseTableParams, sortRows, paginate, hrefWith } from "@/lib/tableQuery";
import { orders as live } from "@/lib/db";

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("  ok  " + name); };

const now = Date.UTC(2026, 9, 21, 9, 30); // fixed "now": 21 Oct 2026, 12:30 in Addis
const sample = getOrders("sample", now);
const today = addisDayIndex(now);

// independent calculation: filter by calendar day in Addis time, no helper from analytics.js
function brute(days, offsetDays = 0) {
  const to = today - offsetDays;
  const from = to - days + 1;
  const rows = sample.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    const d = Math.floor((t + 3 * 3600 * 1000) / 86400000);
    return d >= from && d <= to && o.status !== "cancelled";
  });
  return { revenue: rows.reduce((s, o) => s + o.quantity * (o.total / o.quantity), 0), orders: rows.length };
}

console.log("sample data");
test("is deterministic (same day, same data)", () => {
  const a = getSampleOrders(now).map((o) => o.id + o.total).join();
  const b = getSampleOrders(now).map((o) => o.id + o.total).join();
  assert.equal(a, b);
});
test("every record is marked as sample", () => assert.ok(sample.every((o) => o.isSample === true)));
test("covers the days promised", () => {
  const days = new Set(sample.map((o) => addisDayIndex(new Date(o.createdAt).getTime())));
  assert.equal(days.size, SAMPLE_DAYS);
});

console.log("summaries match brute force");
for (const key of Object.keys(RANGES)) {
  const days = RANGES[key].days;
  test(`${key}: revenue, orders and previous period`, () => {
    const s = summarize(sample, key, now);
    const cur = brute(days), prev = brute(days, days);
    assert.equal(s.current.revenue, cur.revenue);
    assert.equal(s.current.orders, cur.orders);
    assert.equal(s.previous.revenue, prev.revenue);
    assert.equal(s.previous.orders, prev.orders);
    assert.equal(s.current.average, cur.orders ? cur.revenue / cur.orders : 0);
  });
  test(`${key}: neighbourhood bars add up to total revenue`, () => {
    const s = summarize(sample, key, now);
    assert.equal(s.byNeighbourhood.reduce((n, r) => n + r.revenue, 0), s.current.revenue);
    assert.equal(s.byNeighbourhood.reduce((n, r) => n + r.orders, 0), s.current.orders);
  });
  test(`${key}: the time series adds up to the totals and has the right number of points`, () => {
    const s = summarize(sample, key, now);
    assert.equal(s.series.reduce((n, p) => n + p.revenue, 0), s.current.revenue);
    assert.equal(s.series.reduce((n, p) => n + p.orders, 0), s.current.orders);
    assert.equal(s.series.length, RANGES[key].unit === "week" ? Math.ceil(days / 7) : days);
  });
  test(`${key}: top dishes never exceed total revenue and are sorted`, () => {
    const s = summarize(sample, key, now);
    const r = s.topDishes.map((d) => d.revenue);
    assert.deepEqual(r, [...r].sort((a, b) => b - a));
    assert.ok(r.reduce((a, b) => a + b, 0) <= s.current.revenue);
  });
}
test("the 30d range includes today and excludes the day before the window", () => {
  const s = summarize(sample, "30d", now);
  assert.equal(s.endDay, today);
  assert.equal(s.startDay, today - 29);
});

console.log("change calculation");
test("growth is (current - previous) / previous", () => {
  assert.equal(describeChange(120, 100).pct, 20);
  assert.equal(describeChange(80, 100).pct, -20);
  assert.equal(describeChange(100, 100).direction, "flat");
});
test("a zero previous period never produces Infinity or NaN", () => {
  const c = describeChange(500, 0);
  assert.equal(c.direction, "none");
  assert.ok(!/Infinity|NaN/.test(c.text));
  assert.equal(describeChange(0, 0).direction, "none");
});
test("invalid numbers are handled", () => assert.equal(describeChange(NaN, 5).direction, "none"));

console.log("edge cases");
test("a day boundary follows Addis time, not UTC", () => {
  const justBeforeMidnight = addisDayStart(today) + 24 * 3600 * 1000 - 1000; // 23:59:59 Addis
  const justAfter = addisDayStart(today + 1) + 1000;
  assert.equal(addisDayIndex(justBeforeMidnight), today);
  assert.equal(addisDayIndex(justAfter), today + 1);
});
test("cancelled orders earn no revenue but are counted separately", () => {
  const s = summarize(sample, "30d", now);
  assert.ok(s.current.cancelled > 0);
  assert.equal(s.rows.length, s.current.orders + s.current.cancelled);
});
test("an empty data set gives zeros, not errors", () => {
  const s = summarize([], "7d", now);
  assert.equal(s.current.revenue, 0);
  assert.equal(s.current.average, 0);
  assert.equal(s.series.length, 7);
  assert.equal(s.byNeighbourhood.length, 6);
  assert.equal(s.change.revenue.direction, "none");
});
test("a malformed order is ignored instead of crashing", () => {
  live.push({ id: "bad", createdAt: "not a date", dishId: "1", quantity: 1 });
  try { assert.doesNotThrow(() => getOrders("live", now)); assert.equal(getOrders("live", now).length, 0); }
  finally { live.length = 0; }
});
test("an order without a stored total is priced from the menu", () => {
  live.push({ id: "old", createdAt: new Date(now).toISOString(), dishId: "1", quantity: 2, name: "x" });
  try { assert.equal(getOrders("live", now)[0].total, 700); } finally { live.length = 0; }
});
test("unknown ranges and sources fall back safely", () => {
  assert.equal(parseRange("banana"), "30d");
  assert.equal(parseRange(undefined), "30d");
  assert.equal(parseSource("x", 0), "sample");
  assert.equal(parseSource(undefined, 3), "live");
  assert.equal(parseSource("sample", 3), "sample");
});
test("money is formatted as ETB", () => assert.match(formatETB(12500), /ETB\s?12,500/));

console.log("table helpers");
const rows = Array.from({ length: 12 }, (_, i) => ({ id: "r" + i, total: (i * 37) % 11 }));
test("bad sort, direction and page values fall back to defaults", () => {
  const p = parseTableParams({ sort: "<script>", dir: "sideways", page: "-4" }, { sorts: ["date", "total"], defaultSort: "date" });
  assert.deepEqual([p.sort, p.dir, p.page], ["date", "desc", 1]);
});
test("sorting is correct, stable and reversible", () => {
  const asc = sortRows(rows, "total", "asc", { total: (r) => r.total }).map((r) => r.total);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  const desc = sortRows(rows, "total", "desc", { total: (r) => r.total }).map((r) => r.total);
  assert.deepEqual(desc, [...desc].sort((a, b) => b - a));
});
test("paging: 12 rows at 5 per page is 3 pages; a page past the end shows the last", () => {
  assert.equal(paginate(rows, 1, 5).totalPages, 3);
  assert.equal(paginate(rows, 3, 5).rows.length, 2);
  assert.equal(paginate(rows, 99, 5).page, 3);
  assert.equal(paginate([], 1, 5).page, 1);
});
test("links keep the other parameters", () => {
  assert.equal(hrefWith("/orders", { sort: "total", dir: "asc", page: 2 }, { page: 3 }), "/orders?sort=total&dir=asc&page=3");
  assert.equal(hrefWith("/orders", { page: 2 }, { page: "" }), "/orders");
});

console.log(`\n${passed} checks passed`);
