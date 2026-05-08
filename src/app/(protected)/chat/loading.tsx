import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="relative flex h-[calc(100dvh-4rem-6rem)] flex-col overflow-hidden bg-background/30 lg:h-[calc(100dvh-4rem)]">

      {/* Message area — empty state layout */}
      <div className="flex-1 overflow-hidden px-4 py-5 flex flex-col items-center justify-start sm:justify-center sm:py-8">

        {/* Chef icon */}
        <div className="relative mb-4 w-12 h-12 sm:mb-5 sm:w-16 sm:h-16">
          <Skeleton className="absolute inset-0 rounded-xl scale-[1.8] opacity-30" />
          <Skeleton className="relative h-12 w-12 rounded-xl sm:h-16 sm:w-16" />
        </div>

        {/* Title + subtitle */}
        <Skeleton className="h-8 w-56 rounded-xl mb-2 sm:h-12 sm:w-80 md:h-14 md:w-96" />
        <Skeleton className="h-4 w-64 rounded-lg mb-5 sm:w-80 sm:mb-8" />

        {/* Prompt cards — 1 col mobile, 2 col sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg sm:gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-3 sm:p-3.5"
            >
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-3 w-2/3 rounded-md" />
                <Skeleton className="h-2 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="relative z-10 border-t border-border/30 bg-background/80 p-3 sm:p-4">
        <div className="mx-auto max-w-3xl flex items-end gap-2">
          <Skeleton className="h-11 flex-1 rounded-2xl sm:h-14" />
          <Skeleton className="h-11 w-11 rounded-xl shrink-0 sm:h-14 sm:w-14" />
        </div>
      </div>
    </div>
  );
}
