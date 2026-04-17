import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function RecipeCardSkeleton() {
  return (
    <div className="group relative h-full">
      <Card className="relative overflow-hidden border-border/50 bg-card/60 glass h-full flex flex-col rounded-2xl animate-pulse">
        {/* Image Area Skeleton */}
        <div className="block relative aspect-[4/3] bg-muted/40 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-10">
             <Skeleton className="h-5 w-16 rounded-lg bg-background/20" />
             <Skeleton className="h-8 w-8 rounded-full bg-background/20" />
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
             <Skeleton className="h-3 w-16 rounded bg-background/20" />
             <Skeleton className="h-6 w-12 rounded-lg bg-background/20" />
          </div>
        </div>
        
        <div className="flex flex-col flex-1">
          <CardHeader className="p-4 pb-2">
            <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
            <Skeleton className="h-6 w-1/2 rounded-md" />
          </CardHeader>
          
          <CardContent className="p-4 pt-0 mt-auto">
            <div className="flex items-center justify-between gap-4 py-3 border-t border-border/30">
              <div className="flex flex-col gap-1.5">
                 <Skeleton className="h-3 w-14 rounded bg-muted/60" />
                 <Skeleton className="h-4 w-12 rounded bg-muted" />
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                 <Skeleton className="h-3 w-14 rounded bg-muted/60" />
                 <Skeleton className="h-4 w-12 rounded bg-muted" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
