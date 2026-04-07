import { Skeleton } from '@/components/ui/skeleton';

export function RecipeDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Hero image placeholder */}
      <Skeleton className="w-full aspect-video rounded-lg mb-6" />

      {/* Title and meta */}
      <Skeleton className="h-8 w-3/4 mb-2" />
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Tab bar */}
      <Skeleton className="h-10 w-full mb-6" />

      {/* Content line placeholders */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
