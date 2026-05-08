import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-12 space-y-2">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-12 w-56 rounded-xl lg:h-14" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>

        {/* Two-card grid — stacked on mobile, 5-col split on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">

          {/* Account Info card — lg:col-span-2 */}
          <div className="lg:col-span-2 flex flex-col rounded-xl border border-border/50 bg-card/60">
            {/* Card header */}
            <div className="flex items-start gap-3 p-6 pb-4 border-b border-border/40">
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-2.5 w-16 rounded-full" />
                <Skeleton className="h-4 w-28 rounded-lg" />
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
            </div>

            {/* Card body */}
            <div className="flex flex-col flex-1 gap-5 p-6">
              {/* Avatar row */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-44 rounded-md" />
                </div>
              </div>

              <Skeleton className="h-px w-full" />

              {/* Display Name field */}
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28 rounded-full" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>

              <div className="flex-1" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          {/* Preferences card — lg:col-span-3 */}
          <div className="lg:col-span-3 flex flex-col rounded-xl border border-border/50 bg-card/60">
            {/* Card header */}
            <div className="flex items-start gap-3 p-6 pb-4 border-b border-border/40">
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-2.5 w-24 rounded-full" />
                <Skeleton className="h-4 w-28 rounded-lg" />
                <Skeleton className="h-3 w-56 rounded-md" />
              </div>
            </div>

            {/* Card body — 3 multi-select fields */}
            <div className="flex flex-col flex-1 gap-5 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-32 rounded-full" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}

              <div className="flex-1" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
