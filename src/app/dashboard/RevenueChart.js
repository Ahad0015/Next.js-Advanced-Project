"use client";

// The ONLY client code on the dashboard page: the two charts. Recharts draws SVG in the browser
// (it measures the screen), so it must be a client component. Everything else on the page
// (the numbers, the tables, the filters) is rendered on the server and passed in as plain data.
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { formatETB } from "@/lib/format";

const BRAND = "#1d6b44";
const GOLD = "#b87800";
const GRID = "#d8d8cd";
const AXIS = { fontSize: 12, fill: "#55605a" };

// 12500 -> "12.5k": short tick labels so the axis never gets crowded on a phone.
const etbTick = (v) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v));

// A fixed-height box: the chart fills it, so the page does not jump while the chart loads.
// initialDimension lets the chart render once on the server instead of an empty box.
function ChartBox({ label, children }) {
  return (
    <div className="h-72 w-full" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 288 }}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueBarChart({ data, label }) {
  return (
    <ChartBox label={label}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis
          tick={AXIS}
          tickFormatter={etbTick}
          width={52}
          tickLine={false}
          axisLine={false}
          label={{ value: "Revenue (ETB)", angle: -90, position: "insideLeft", offset: 4, style: { ...AXIS, textAnchor: "middle" } }}
        />
        <Tooltip formatter={(value) => [formatETB(value), "Revenue"]} cursor={{ fill: "#e3f0e8" }} />
        <Legend />
        <Bar dataKey="revenue" name="Revenue (ETB)" fill={BRAND} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ChartBox>
  );
}

export function OrdersLineChart({ data, label, unit }) {
  return (
    <ChartBox label={label}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval="preserveStartEnd" minTickGap={28} />
        <YAxis
          tick={AXIS}
          allowDecimals={false}
          width={44}
          tickLine={false}
          axisLine={false}
          label={{ value: `Orders per ${unit}`, angle: -90, position: "insideLeft", offset: 8, style: { ...AXIS, textAnchor: "middle" } }}
        />
        <Tooltip formatter={(value) => [value, "Orders"]} labelFormatter={(l) => (unit === "week" ? `Week of ${l}` : l)} />
        <Legend />
        <Line type="monotone" dataKey="orders" name="Orders" stroke={GOLD} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
      </LineChart>
    </ChartBox>
  );
}
