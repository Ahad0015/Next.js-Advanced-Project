import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "./Icons";

// Paging with real links: each page is a URL, so it works without JavaScript,
// can be bookmarked, and keeps the other query parameters (sort, range...) because
// the caller builds each href with hrefWith().
export default function Pagination({ page, totalPages, from, to, total, hrefFor, label = "Pagination" }) {
  if (total === 0) return null;

  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const linkClass = "btn btn-secondary btn-sm min-w-9";
  return (
    <nav aria-label={label} className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted">
        Showing {from}–{to} of {total}
      </p>
      <ul className="flex items-center gap-1">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} className={linkClass} aria-label="Previous page"><IconChevronLeft width={16} height={16} /></Link>
          ) : (
            <span className={`${linkClass} opacity-50`} aria-hidden="true"><IconChevronLeft width={16} height={16} /></span>
          )}
        </li>
        {pages.map((p, i) => (
          <li key={`${p}-${i}`}>
            {p === "…" ? (
              <span className="px-2 text-muted" aria-hidden="true">…</span>
            ) : p === page ? (
              <span aria-current="page" className="btn btn-primary btn-sm min-w-9">{p}</span>
            ) : (
              <Link href={hrefFor(p)} className={linkClass} aria-label={`Page ${p}`}>{p}</Link>
            )}
          </li>
        ))}
        <li>
          {page < totalPages ? (
            <Link href={hrefFor(page + 1)} className={linkClass} aria-label="Next page"><IconChevronRight width={16} height={16} /></Link>
          ) : (
            <span className={`${linkClass} opacity-50`} aria-hidden="true"><IconChevronRight width={16} height={16} /></span>
          )}
        </li>
      </ul>
    </nav>
  );
}
