import { Skeleton } from "@/components/ui/skeleton";

export default function FavoritesLoading() {
  return (
    <div className="bg-background/50 min-h-dvh">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* Page header */}
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end sm:mb-10">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-10 w-52 rounded-xl sm:h-12 lg:h-14" />
          </div>
        </div>

        {/* Recipe grid — matches grid-cols-1 / sm:grid-cols-2 / lg:grid-cols-3 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
  );
}
