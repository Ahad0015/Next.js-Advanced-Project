import { Skeleton } from "@/components/ui";

// A skeleton shaped like the real page: a heading and a table with five rows.
export default function Loading() {
  return (
    <main aria-busy="true">
      <div role="status" aria-label="Loading your orders">
        <Skeleton className="mb-3 h-10 w-56" />
        <Skeleton className="mb-8 h-5 w-96 max-w-full" />
        <div className="rounded-xl border border-line bg-surface p-3">
          <Skeleton className="mb-3 h-9 w-full" />
          {[1, 2, 3, 4, 5].map((n) => <Skeleton key={n} className="mb-2 h-12 w-full last:mb-0" />)}
        </div>
      </div>
    </main>
  );
}
