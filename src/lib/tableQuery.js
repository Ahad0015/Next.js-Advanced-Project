// Sorting, paging and links for tables whose state lives in the URL.
// Because the state is in the URL, a sorted page can be bookmarked, shared and reloaded,
// and it works without any client-side JavaScript.

// Read ?sort=&dir=&page= safely. Anything unexpected falls back to the defaults.
export function parseTableParams(searchParams, { sorts, defaultSort, defaultDir = "desc", pageSize = 5 }) {
  const sort = sorts.includes(searchParams?.sort) ? searchParams.sort : defaultSort;
  const dir = searchParams?.dir === "asc" || searchParams?.dir === "desc" ? searchParams.dir : defaultDir;
  const rawPage = Number.parseInt(searchParams?.page, 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  return { sort, dir, page, pageSize };
}

export function sortRows(rows, sort, dir, getters) {
  const get = getters[sort];
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = get(a);
    const y = get(b);
    const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
    return cmp * sign || String(a.id).localeCompare(String(b.id)); // stable tie-break
  });
}

export function paginate(rows, page, pageSize) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages); // a page number past the end shows the last page
  const start = (safePage - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), page: safePage, totalPages, total, from: total ? start + 1 : 0, to: Math.min(start + pageSize, total) };
}

// Build a link that keeps the other query parameters and changes only some.
export function hrefWith(basePath, current, changes) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, ...changes })) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const q = params.toString();
  return q ? `${basePath}?${q}` : basePath;
}
