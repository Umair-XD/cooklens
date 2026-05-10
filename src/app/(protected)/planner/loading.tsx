import { Skeleton } from "@/components/ui/skeleton";

export default function PlannerLoading() {
  return (
    <div className="min-h-dvh bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-10 w-72 rounded-xl lg:h-14 lg:w-80" />
            <Skeleton className="h-5 w-64 rounded-lg sm:w-80" />
          </div>
        </div>

        {/* Sidebar + plan area */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

          {/* Form sidebar */}
          <div className="w-full lg:w-[350px] lg:shrink-0 space-y-4">
            <div className="rounded-xl border border-border/50 bg-card/60 p-6 space-y-5">
              <Skeleton className="h-6 w-40 rounded-lg" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded-full" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>

          {/* Plan area */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-36 rounded-lg" />
                  <Skeleton className="h-3 w-28 rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <Skeleton className="h-9 w-full rounded-xl sm:w-32" />
                <Skeleton className="h-9 w-full rounded-xl sm:w-32" />
              </div>
            </div>

            {/* Mobile: day tab strip + 3 meal cards */}
            <div className="md:hidden space-y-4">
              <div className="grid grid-cols-7 gap-1 rounded-xl border border-border/50 p-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-4 w-16 rounded-md" />
              <div className="flex flex-col gap-1 rounded-xl border border-border/50 p-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border/30 p-4 space-y-3">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-20 rounded-lg" />
                    <div className="flex gap-2 pt-1 border-t border-border/20">
                      <Skeleton className="h-4 w-14 rounded-full" />
                      <Skeleton className="h-4 w-14 rounded-full" />
                      <Skeleton className="h-4 w-14 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: 7-column scrollable day grid — overflow-x-auto contained */}
            <div className="hidden overflow-x-auto md:block">
              <div className="flex gap-6 min-w-[max-content]">
                {Array.from({ length: 7 }).map((_, dayIdx) => (
                  <div key={dayIdx} className="w-[260px] flex-shrink-0 space-y-4">
                    <div className="flex items-center justify-between px-2 pt-1">
                      <Skeleton className="h-4 w-10 rounded-md" />
                      <Skeleton className="h-1 w-8 rounded-full" />
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl border border-border/50 p-1">
                      {Array.from({ length: 3 }).map((_, mealIdx) => (
                        <div key={mealIdx} className="rounded-xl border border-border/30 p-4 space-y-3">
                          <Skeleton className="h-3 w-16 rounded-full" />
                          <Skeleton className="h-5 w-4/5 rounded-lg" />
                          <Skeleton className="h-4 w-20 rounded-lg" />
                          <div className="flex gap-2 pt-1 border-t border-border/20">
                            <Skeleton className="h-4 w-12 rounded-full" />
                            <Skeleton className="h-4 w-12 rounded-full" />
                            <Skeleton className="h-4 w-12 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
