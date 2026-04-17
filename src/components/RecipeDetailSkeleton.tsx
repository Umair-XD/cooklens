import { Skeleton } from '@/components/ui/skeleton';

export function RecipeDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8 animate-pulse">
      {/* Hero image placeholder */}
      <Skeleton className="w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl mb-10 border border-border/50 bg-muted/40" />

      {/* Title and meta */}
      <Skeleton className="h-12 w-3/4 mb-4 rounded-2xl bg-muted/60" />
      <div className="flex gap-4 mb-10">
        <Skeleton className="h-8 w-24 rounded-xl bg-muted/40" />
        <Skeleton className="h-8 w-24 rounded-xl bg-muted/40" />
        <Skeleton className="h-8 w-20 rounded-xl bg-muted/40" />
      </div>

      {/* Two column layout like real detail page */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Ingredients sidebar */}
        <div className="md:col-span-1 space-y-4">
           <Skeleton className="h-8 w-1/2 mb-6 rounded-xl bg-muted/60" />
           <div className="space-y-4 p-8 glass rounded-3xl border border-border/50 shadow-premium">
             {Array.from({length: 6}).map((_, i) => (
                <div key={i} className="flex items-center justify-between pb-4 border-b border-border/20 last:border-0 last:pb-0">
                  <Skeleton className="h-5 w-24 rounded-md bg-muted/40" />
                  <Skeleton className="h-5 w-12 rounded-md bg-muted/20" />
                </div>
             ))}
           </div>
        </div>

        {/* Instructions */}
        <div className="md:col-span-2 space-y-4">
           <Skeleton className="h-8 w-1/3 mb-6 rounded-xl bg-muted/60" />
           <div className="space-y-6">
             {Array.from({length: 4}).map((_, i) => (
                <div key={i} className="space-y-3 p-8 glass rounded-3xl border border-border/50 shadow-premium">
                  <Skeleton className="h-6 w-20 rounded-md bg-muted/60 mb-4" />
                  <Skeleton className="h-4 w-full rounded-sm bg-muted/40" />
                  <Skeleton className="h-4 w-5/6 rounded-sm bg-muted/40" />
                  <Skeleton className="h-4 w-3/4 rounded-sm bg-muted/40" />
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
