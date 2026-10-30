// SAMPLE DATA: for development and demonstration only.
//
// The shop has no sales history yet (orders live in memory and start empty), so the dashboard
// can show this generated data instead. It is deterministic (the same day always produces the
// same numbers), every record is marked `isSample: true`, and the dashboard labels it clearly.
// It must never be presented as real revenue.
import { dishes } from "@/app/menu/data";
import { NEIGHBOURHOODS } from "./neighbourhoods";
import { addisDayIndex, addisDayStart } from "./format";

export const SAMPLE_DAYS = 190; // enough for a 90-day range plus the previous 90 days

// Small seeded random number generator (mulberry32): same seed, same sequence.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(random, weighted) {
  const total = weighted.reduce((s, [, w]) => s + w, 0);
  let r = random() * total;
  for (const [value, w] of weighted) {
    if ((r -= w) < 0) return value;
  }
  return weighted[weighted.length - 1][0];
}

const AREA_WEIGHTS = [
  ["Bole", 30], ["Kazanchis", 20], ["Piassa", 16], ["Sarbet", 14], ["Megenagna", 12], ["Gerji", 8],
].filter(([name]) => NEIGHBOURHOODS.includes(name));

let cache = { key: null, orders: [] };

export function getSampleOrders(now = Date.now()) {
  const today = addisDayIndex(now);
  if (cache.key === today) return cache.orders;

  const dishWeights = dishes.map((d, i) => [d, Math.max(2, 10 - i)]); // earlier dishes sell more
  const orders = [];

  for (let back = SAMPLE_DAYS - 1; back >= 0; back--) {
    const dayIndex = today - back;
    const random = rng(dayIndex * 7919);
    const weekday = new Date(addisDayStart(dayIndex) + 12 * 3600 * 1000).getUTCDay(); // 0 = Sunday
    const weekend = weekday === 5 || weekday === 6 || weekday === 0; // Friday to Sunday are busier
    const count = 5 + (weekend ? 4 : 0) + Math.floor(random() * 5);

    for (let i = 0; i < count; i++) {
      const dish = pick(random, dishWeights);
      const quantity = 1 + Math.floor(random() * 3);
      const hour = 11 + Math.floor(random() * 11); // orders between 11:00 and 21:59
      const minute = Math.floor(random() * 60);
      const createdAt = new Date(addisDayStart(dayIndex) + (hour * 60 + minute) * 60 * 1000);
      // Pending states only make sense for today's orders; older ones are finished.
      orders.push({
        id: `sample-${dayIndex}-${i}`,
        isSample: true,
        userId: "sample",
        name: "Sample customer",
        dishId: dish.id,
        dishName: dish.name,
        quantity,
        neighbourhood: pick(random, AREA_WEIGHTS),
        unitPrice: dish.price,
        total: dish.price * quantity,
        status: random() < 0.04 ? "cancelled" : "delivered",
        createdAt: createdAt.toISOString(),
      });
    }
  }

  cache = { key: today, orders };
  return orders;
}
