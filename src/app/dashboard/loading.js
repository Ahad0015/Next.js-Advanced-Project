import { Skeleton } from "@/components/ui";

// The loading state: a skeleton with the same shape as the finished dashboard
// (heading, filters, four cards, two charts), so the page does not jump when the data arrives.
export default function Loading() {
  return (
    <main aria-busy="true">
      <div role="status" aria-label="Loading the dashboard">
        <Skeleton className="mb-3 h-10 w-48" />
        <Skeleton className="mb-8 h-5 w-96 max-w-full" />
        <Skeleton className="mb-6 h-10 w-full" />
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-32" />)}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    </main>
  );
}
