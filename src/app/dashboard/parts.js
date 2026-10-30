// Server-rendered building blocks for the dashboard. No state, no client JavaScript.
import Link from "next/link";
import { IconAlert, IconArrowDown, IconArrowUp } from "@/components/Icons";
import { RANGES } from "@/lib/analytics";
import { hrefWith } from "@/lib/tableQuery";

export function SourceBanner({ source, liveCount }) {
  if (source === "sample") {
    return (
      <div className="alert alert-info mb-6" role="note">
        <IconAlert width={18} height={18} className="mt-0.5 shrink-0" />
        <p>
          <strong>Sample data.</strong> These numbers are generated for demonstration. They are not real sales.
          {liveCount === 0
            ? " No real orders have been placed since the server started."
            : ` ${liveCount} real ${liveCount === 1 ? "order has" : "orders have"} been placed since the server started.`}
        </p>
      </div>
    );
  }
  return (
    <div className="alert alert-ok mb-6" role="note">
      <p><strong>Live data.</strong> Orders placed through this app since the server started ({liveCount} so far).</p>
    </div>
  );
}

// Range and data-source filters are plain links: the choice lives in the URL, so it can be bookmarked.
export function Filters({ range, source, query }) {
  const seg = (active) => `btn btn-sm ${active ? "btn-primary" : "btn-secondary"}`;
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Date range" className="flex flex-wrap gap-2">
        {Object.entries(RANGES).map(([key, r]) => (
          <Link key={key} href={hrefWith("/dashboard", query, { range: key, page: 1 })} className={seg(range === key)} aria-current={range === key ? "true" : undefined}>
            {r.label}
          </Link>
        ))}
      </nav>
      <nav aria-label="Data source" className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Data:</span>
        {[["sample", "Sample"], ["live", "Live"]].map(([key, label]) => (
          <Link key={key} href={hrefWith("/dashboard", query, { source: key, page: 1 })} className={seg(source === key)} aria-current={source === key ? "true" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function SummaryCard({ label, value, change, note }) {
  const tone = change?.direction === "up" ? "text-brand-strong" : change?.direction === "down" ? "text-berbere" : "text-muted";
  return (
    <div className="card">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      {change && (
        <p className={`mt-2 flex items-center gap-1 text-sm font-medium ${tone}`}>
          {change.direction === "up" && <IconArrowUp width={16} height={16} />}
          {change.direction === "down" && <IconArrowDown width={16} height={16} />}
          {change.text}
        </p>
      )}
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}
    </div>
  );
}

// The same numbers as a chart, as a real table, for anyone who cannot see the SVG.
export function DataTable({ caption, columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line" role="region" aria-label={caption} tabIndex={0}>
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>{columns.map((c) => <th key={c.key} scope="col" className={c.numeric ? "text-right" : ""}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{columns.map((c) => <td key={c.key} className={c.numeric ? "num" : ""}>{r[c.key]}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
