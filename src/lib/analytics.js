// Pure functions that turn a list of orders into the numbers the dashboard shows.
// They take plain data and return plain data, so they are easy to test and to explain.
import { dishes } from "@/app/menu/data";
import { NEIGHBOURHOODS } from "./neighbourhoods";
import { getSampleOrders } from "./sampleData";
import { getStatus } from "./orders";
import { orders as liveOrders } from "./db";
import { DAY_MS, addisDayIndex, addisDayStart, describeChange, formatDayMonth } from "./format";

export const RANGES = {
  "7d": { days: 7, label: "Last 7 days", unit: "day" },
  "30d": { days: 30, label: "Last 30 days", unit: "day" },
  "90d": { days: 90, label: "Last 90 days", unit: "week" },
};

// Anything that is not a known range falls back to 30 days: URLs are user input.
export const parseRange = (value) => (value in RANGES ? value : "30d");

// The data source: "live" = orders really placed in this running app; "sample" = generated demo data.
export function parseSource(value, liveCount) {
  if (value === "live" || value === "sample") return value;
  return liveCount > 0 ? "live" : "sample"; // default: real data when there is some
}

const dishName = (id) => dishes.find((d) => d.id === id)?.name ?? `Dish ${id}`;
const dishPrice = (id) => dishes.find((d) => d.id === id)?.price ?? 0;

// One normalised shape for every order, whether live or sample.
export function normalise(order) {
  const quantity = Number(order.quantity) || 0;
  const total = Number.isFinite(order.total) ? order.total : dishPrice(order.dishId) * quantity; // older orders had no stored total
  return {
    id: order.id,
    isSample: Boolean(order.isSample),
    name: order.name ?? "",
    dishId: order.dishId,
    dishName: order.dishName ?? dishName(order.dishId),
    quantity,
    neighbourhood: order.neighbourhood ?? "Not recorded",
    total,
    status: order.isSample ? order.status : getStatus(order),
    createdAt: order.createdAt,
  };
}

export function getOrders(source, now = Date.now()) {
  const raw = source === "sample" ? getSampleOrders(now) : liveOrders;
  return raw.map(normalise).filter((o) => Number.isFinite(new Date(o.createdAt).getTime()));
}

export const liveOrderCount = () => liveOrders.length;

const counts = (o) => o.status !== "cancelled"; // cancelled orders earn no revenue

function windowOrders(orders, startDay, endDay) {
  return orders.filter((o) => {
    const d = addisDayIndex(new Date(o.createdAt).getTime());
    return d >= startDay && d <= endDay;
  });
}

function totals(orders) {
  const paying = orders.filter(counts);
  const revenue = paying.reduce((s, o) => s + o.total, 0);
  return { revenue, orders: paying.length, cancelled: orders.length - paying.length, average: paying.length ? revenue / paying.length : 0 };
}

export function summarize(orders, rangeKey, now = Date.now()) {
  const range = RANGES[parseRange(rangeKey)];
  const today = addisDayIndex(now);
  const start = today - (range.days - 1);
  const current = windowOrders(orders, start, today);
  const previous = windowOrders(orders, start - range.days, start - 1); // the period of equal length just before

  const now_ = totals(current);
  const prev = totals(previous);

  // Revenue by neighbourhood (every neighbourhood appears, even with zero).
  const areaNames = [...NEIGHBOURHOODS];
  for (const o of current) if (!areaNames.includes(o.neighbourhood)) areaNames.push(o.neighbourhood);
  const byNeighbourhood = areaNames
    .map((name) => {
      const rows = current.filter((o) => o.neighbourhood === name && counts(o));
      return { name, revenue: rows.reduce((s, o) => s + o.total, 0), orders: rows.length };
    })
    .sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name));

  // Orders and revenue over time: one point per day, or per week for the longest range.
  const bucketDays = range.unit === "week" ? 7 : 1;
  const series = [];
  for (let from = start; from <= today; from += bucketDays) {
    const to = Math.min(from + bucketDays - 1, today);
    const rows = windowOrders(current, from, to).filter(counts);
    series.push({
      label: formatDayMonth(addisDayStart(from) + 12 * 3600 * 1000),
      orders: rows.length,
      revenue: rows.reduce((s, o) => s + o.total, 0),
    });
  }

  // Product performance: best-selling dishes by revenue.
  const byDish = new Map();
  for (const o of current.filter(counts)) {
    const entry = byDish.get(o.dishId) ?? { name: o.dishName, quantity: 0, revenue: 0 };
    entry.quantity += o.quantity;
    entry.revenue += o.total;
    byDish.set(o.dishId, entry);
  }
  const topDishes = [...byDish.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return {
    range: { key: parseRange(rangeKey), ...range },
    current: now_,
    previous: prev,
    change: {
      revenue: describeChange(now_.revenue, prev.revenue),
      orders: describeChange(now_.orders, prev.orders),
      average: describeChange(now_.average, prev.average),
    },
    byNeighbourhood,
    series,
    topDishes,
    rows: current, // every order in the range (including cancelled), for the table
    startDay: start,
    endDay: today,
    DAY_MS,
  };
}
