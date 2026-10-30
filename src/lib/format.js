// Formatting helpers shared by pages, tables and charts.
// Money is always ETB with no decimals; dates are always shown in Addis Ababa time (UTC+3).

const etb = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

export function formatETB(amount) {
  return etb.format(Number.isFinite(amount) ? amount : 0);
}

const TZ = "Africa/Addis_Ababa";
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const dayMonthFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TZ });
const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ });

export const formatDate = (value) => dateFmt.format(new Date(value));
export const formatDayMonth = (value) => dayMonthFmt.format(new Date(value));
export const formatTime = (value) => timeFmt.format(new Date(value));

// Addis Ababa has no daylight saving: it is always UTC+3, so a day boundary is a fixed offset.
export const DAY_MS = 24 * 60 * 60 * 1000;
export const ADDIS_OFFSET_MS = 3 * 60 * 60 * 1000;

// Whole days since 1970 in Addis time. Two timestamps on the same Addis calendar day share an index.
export const addisDayIndex = (ts) => Math.floor((ts + ADDIS_OFFSET_MS) / DAY_MS);
export const addisDayStart = (dayIndex) => dayIndex * DAY_MS - ADDIS_OFFSET_MS; // UTC ms of 00:00 Addis time

// Change compared with the previous period. When there is nothing to compare with
// (previous = 0) a percentage would be meaningless, so say that instead of showing Infinity.
export function describeChange(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return { direction: "none", text: "No comparison available" };
  if (previous === 0) {
    return { direction: "none", text: current === 0 ? "No change (no activity in either period)" : "No earlier period to compare with" };
  }
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.round(pct * 10) / 10;
  if (rounded === 0) return { direction: "flat", pct: 0, text: "No change vs previous period" };
  return {
    direction: rounded > 0 ? "up" : "down",
    pct: rounded,
    text: `${rounded > 0 ? "+" : "-"}${Math.abs(rounded).toFixed(1)}% vs previous period`,
  };
}
