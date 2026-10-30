"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { formatETB } from "@/lib/format";
import { IconAlert, IconChevronLeft, IconChevronRight, IconSearch } from "@/components/Icons";

const PAGE_SIZE = 4;

// Debounced search. When the box is empty it shows `children`: the full menu, already rendered
// on the server, so first paint is never empty or a spinner. As soon as there is a search term
// the results replace it. The request key is `null` for an empty term, which tells SWR to send nothing.
export default function SearchBox({ children }) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  // Wait 300 ms after the last keystroke, so typing "kitfo" is one request, not five.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(term.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [term]);

  const key = debounced ? `/api/dishes?q=${encodeURIComponent(debounced)}&page=${page}&limit=${PAGE_SIZE}` : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    keepPreviousData: true, // keep the old results on screen while the next page loads
    revalidateOnFocus: false,
    dedupingInterval: 60000, // the same search twice reuses the answer
  });

  const typing = term.trim() !== debounced; // the person has typed but the request has not started yet

  return (
    <div>
      <div className="relative mb-5">
        <label htmlFor="menu-search" className="label">Search the menu</label>
        <IconSearch className="pointer-events-none absolute left-3 top-[2.45rem] text-muted" />
        <input
          id="menu-search"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Try “kitfo”, “shiro” or “vegetarian”"
          autoComplete="off"
          className="field pl-10"
        />
      </div>

      {!debounced && !typing && children}
      {!debounced && typing && <p className="text-muted" role="status">Searching…</p>}

      {debounced && (
        <section aria-label="Search results" aria-live="polite">
          {error && (
            <div className="alert alert-error" role="alert">
              <IconAlert width={18} height={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">The search failed.</p>
                <p>Check your connection and try again.</p>
                <button type="button" onClick={() => mutate()} className="btn btn-secondary btn-sm mt-2">Try again</button>
              </div>
            </div>
          )}

          {!error && isLoading && !data && (
            <ul className="grid gap-3 sm:grid-cols-2" aria-hidden="true">
              {[1, 2, 3, 4].map((n) => <li key={n} className="skeleton h-24" />)}
            </ul>
          )}

          {!error && data && data.total === 0 && (
            <div className="card text-center">
              <p className="font-semibold">No dishes match “{debounced}”.</p>
              <p className="mt-1 text-muted">Check the spelling, or search for a category such as Mains.</p>
              <button type="button" onClick={() => setTerm("")} className="btn btn-secondary btn-sm mt-3">Clear search</button>
            </div>
          )}

          {!error && data && data.total > 0 && (
            <>
              <p className="mb-3 text-sm text-muted">
                {data.total} {data.total === 1 ? "dish matches" : "dishes match"} “{debounced}”
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.items.map((d) => (
                  <li key={d.id} className="card flex items-center justify-between gap-3 !p-4">
                    <div>
                      <Link href={`/menu/${d.id}`} className="font-semibold hover:underline">{d.name}</Link>
                      <p className="text-sm text-muted">{d.category}</p>
                    </div>
                    <p className="font-semibold">{formatETB(d.price)}</p>
                  </li>
                ))}
              </ul>
              {data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    <IconChevronLeft width={16} height={16} /> Previous
                  </button>
                  <span className="text-sm text-muted">Page {data.page} of {data.totalPages}</span>
                  <button type="button" className="btn btn-secondary btn-sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next <IconChevronRight width={16} height={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
