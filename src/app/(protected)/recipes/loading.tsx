import { Skeleton } from "@/components/ui/skeleton";

export default function RecipesLoading() {
  return (
    <div className="bg-background/50 min-h-dvh">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* Page header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:mb-10 sm:gap-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-10 w-72 rounded-xl sm:h-12 lg:h-14" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl sm:h-11 sm:w-48" />
        </div>

        {/* Search bar */}
        <div className="mb-7 rounded-xl border border-border/50 p-1.5 sm:mb-12">
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-11 flex-1 rounded-xl sm:h-14" />
            <div className="flex gap-2 sm:w-auto">
              <Skeleton className="h-11 flex-1 rounded-xl sm:hidden" />
              <Skeleton className="h-11 flex-1 rounded-xl px-8 sm:h-14 sm:w-28 sm:flex-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filter sidebar — desktop only */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="rounded-xl border border-border/50 bg-card/60 p-6 space-y-6">
              <Skeleton className="h-5 w-24 rounded-lg" />
              <div className="space-y-3">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </aside>

          {/* Recipe card grid */}
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-3 sm:p-4 space-y-3">
                    <Skeleton className="h-5 w-4/5 rounded-lg" />
                    <Skeleton className="h-4 w-2/5 rounded-lg" />
                    <div className="flex justify-between pt-2 border-t border-border/30">
                      <Skeleton className="h-4 w-16 rounded-lg" />
                      <Skeleton className="h-4 w-16 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
