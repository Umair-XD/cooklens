import { Skeleton } from "@/components/ui/skeleton";
import { WeeklyPlanSkeleton } from "@/components/WeeklyPlanView";

export default function PlannerLoading() {
  return (
    <div className="min-h-screen bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-12 w-80 rounded-xl lg:h-14" />
            <Skeleton className="h-5 w-96 rounded-lg" />
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
          <div className="min-w-0 flex-1">
            <WeeklyPlanSkeleton />
          </div>
        </div>

      </div>
    </div>
  );
}
