import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="w-full aspect-video bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/3 mt-1" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
