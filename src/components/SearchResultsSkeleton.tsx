import { RecipeCardSkeleton } from '@/components/RecipeCardSkeleton';

interface SearchResultsSkeletonProps {
  count?: number;
}

export function SearchResultsSkeleton({ count = 6 }: SearchResultsSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}
