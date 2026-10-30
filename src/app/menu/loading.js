import { Skeleton } from "@/components/ui";

// Shown while the menu segment loads: the same shape as the page, so nothing jumps when it arrives.
export default function Loading() {
  return (
    <main aria-busy="true">
      <div role="status" aria-label="Loading the menu">
        <Skeleton className="mb-3 h-10 w-48" />
        <Skeleton className="mb-8 h-5 w-80 max-w-full" />
        <Skeleton className="mb-6 h-12 w-full" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => <Skeleton key={n} className="h-72" />)}
        </div>
      </div>
    </main>
  );
}
