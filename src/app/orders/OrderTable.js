import Link from "next/link";
import Pagination from "@/components/Pagination";
import { StatusBadge } from "@/components/ui";
import { IconArrowDown, IconArrowUp, IconSort } from "@/components/Icons";
import { formatDate, formatETB, formatTime } from "@/lib/format";
import { hrefWith } from "@/lib/tableQuery";

// Real table markup, sorted and paged from the URL. A server component with no client JavaScript:
// every sort heading and every page number is a plain link.
export const COLUMNS = {
  date: { label: "Placed", sortable: true, render: (o) => (<><span>{formatDate(o.createdAt)}</span> <span className="text-muted">{formatTime(o.createdAt)}</span></>) },
  customer: { label: "Customer", render: (o) => o.name },
  dish: { label: "Dish", sortable: true, render: (o) => o.dishName },
  quantity: { label: "Qty", numeric: true, render: (o) => o.quantity },
  area: { label: "Neighbourhood", sortable: true, render: (o) => o.neighbourhood ?? "Not recorded" },
  total: { label: "Total", sortable: true, numeric: true, render: (o) => formatETB(o.total) },
  status: { label: "Status", sortable: true, render: (o) => <StatusBadge status={o.status} /> },
};

export default function OrderTable({ rows, columns, caption, basePath, query, sort, dir, paging, renderActions, actionsLabel = "Actions" }) {
  const hrefFor = (changes) => hrefWith(basePath, query, changes);

  return (
    <div>
      {/* tabIndex lets keyboard users scroll the table sideways on a small screen */}
      <div className="overflow-x-auto rounded-xl border border-line bg-surface" role="region" aria-label={caption} tabIndex={0}>
        <table className="data-table">
          <caption className="sr-only">{caption}. Sorted by {COLUMNS[sort]?.label.toLowerCase()}, {dir === "asc" ? "ascending" : "descending"}.</caption>
          <thead>
            <tr>
              {columns.map((key) => {
                const col = COLUMNS[key];
                const current = key === sort;
                const nextDir = current ? (dir === "asc" ? "desc" : "asc") : col.numeric || key === "date" ? "desc" : "asc";
                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={col.sortable ? (current ? (dir === "asc" ? "ascending" : "descending") : "none") : undefined}
                    className={col.numeric ? "text-right" : ""}
                  >
                    {col.sortable ? (
                      <Link href={hrefFor({ sort: key, dir: nextDir, page: 1 })} className="inline-flex items-center gap-1 hover:text-ink">
                        {col.label}
                        {current ? (dir === "asc" ? <IconArrowUp width={14} height={14} /> : <IconArrowDown width={14} height={14} />) : <IconSort width={14} height={14} className="opacity-50" />}
                        <span className="sr-only">, {current ? `sorted ${dir === "asc" ? "ascending" : "descending"}, activate to reverse` : "activate to sort"}</span>
                      </Link>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
              {renderActions && <th scope="col"><span className="sr-only">{actionsLabel}</span></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                {columns.map((key) => (
                  <td key={key} className={COLUMNS[key].numeric ? "num" : ""}>{COLUMNS[key].render(o)}</td>
                ))}
                {renderActions && <td>{renderActions(o)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination {...paging} hrefFor={(p) => hrefFor({ page: p })} label={`${caption} pages`} />
    </div>
  );
}
