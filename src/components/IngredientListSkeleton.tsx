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
          className="inline-flex h-8 w-24 items-center rounded-2xl bg-muted/40 border border-border/50"
        />
      ))}
    </div>
  );
}
