import { Skeleton } from '@/components/ui/skeleton';

interface IngredientListSkeletonProps {
  count?: number;
}

export function IngredientListSkeleton({ count = 4 }: IngredientListSkeletonProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="inline-flex h-6 w-20 items-center rounded-full px-2.5 py-0.5"
        />
      ))}
    </div>
  );
}
