import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChatMessageSkeletonProps {
  lines?: number;
  className?: string;
}

export default function ChatMessageSkeleton({
  lines = 3,
  className,
}: ChatMessageSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)} role="status" aria-label="Loading response">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
